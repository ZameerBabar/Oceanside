const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// Helper function to verify manager
const verifyManager = async (uid) => {
  try {
    const managerDoc = await db.collection('managers').doc(uid).get();
    if (!managerDoc.exists || managerDoc.data().role !== 'Manager') {
      throw new functions.https.HttpsError('permission-denied', 'Only managers can perform this action');
    }
    return managerDoc.data();
  } catch (error) {
    console.error('Manager verification failed:', error);
    throw new functions.https.HttpsError('permission-denied', 'Manager verification failed');
  }
};

// Test function
exports.testFunction = functions.https.onCall((data, context) => {
  return {
    success: true,
    message: 'Firebase Functions working!',
    timestamp: new Date().toISOString(),
    userAuth: context.auth ? 'Authenticated' : 'Not authenticated'
  };
});

// Create Employee Function
exports.createEmployee = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to create employees');
  }

  // Manager verification
  await verifyManager(context.auth.uid);

  const { name, email, role, location } = data;

  // Validation
  if (!name || !email) {
    throw new functions.https.HttpsError('invalid-argument', 'Name and email are required');
  }

  if (!role || !location) {
    throw new functions.https.HttpsError('invalid-argument', 'Role and location are required');
  }

  try {
    // Generate temporary password
    const tempPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!1';
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: tempPassword,
      displayName: name,
      emailVerified: false
    });

    console.log('Created user in Auth:', userRecord.uid);

    // Determine collection based on role
    const collectionName = role === 'Manager' ? 'managers' : 'users';
    
    // Save employee data to Firestore
    const employeeData = {
      name,
      email,
      role,
      location,
      status: 'Pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: userRecord.uid,
      createdBy: context.auth.uid
    };

    await db.collection(collectionName).doc(userRecord.uid).set(employeeData);

    // Generate password reset link for invitation
    try {
      const resetLink = await auth.generatePasswordResetLink(email);
      console.log('Password reset link generated for:', email);
      
      // Update employee record with invite info
      await db.collection(collectionName).doc(userRecord.uid).update({
        inviteSentAt: admin.firestore.FieldValue.serverTimestamp(),
        inviteLink: resetLink
      });
    } catch (inviteError) {
      console.error('Failed to generate invite link:', inviteError);
    }

    return { 
      success: true, 
      message: 'Employee created successfully and invitation sent',
      employeeId: userRecord.uid,
      collectionName
    };

  } catch (error) {
    console.error('Error creating employee:', error);
    
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'An account with this email already exists');
    }
    
    if (error.code === 'auth/invalid-email') {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to create employee: ' + error.message);
  }
});

// Activate Employee Function
exports.activateEmployee = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to activate employees');
  }

  // Manager verification
  await verifyManager(context.auth.uid);

  const { uid, collectionName } = data;

  // Validation
  if (!uid || !collectionName) {
    throw new functions.https.HttpsError('invalid-argument', 'Employee UID and collection name are required');
  }

  try {
    // Check if employee exists
    const employeeDoc = await db.collection(collectionName).doc(uid).get();
    if (!employeeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Employee not found');
    }

    // Update employee status
    await db.collection(collectionName).doc(uid).update({
      status: 'Active',
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      activatedBy: context.auth.uid
    });

    // Also enable the user in Firebase Auth if they exist
    try {
      await auth.updateUser(uid, { disabled: false });
      console.log('Enabled user in Auth:', uid);
    } catch (authError) {
      console.log('User not found in Auth or already enabled:', authError.message);
    }

    return { 
      success: true, 
      message: 'Employee activated successfully',
      employeeId: uid
    };

  } catch (error) {
    console.error('Error activating employee:', error);
    throw new functions.https.HttpsError('internal', 'Failed to activate employee: ' + error.message);
  }
});

// Delete Employee Function
exports.deleteEmployee = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to delete employees');
  }

  // Manager verification
  await verifyManager(context.auth.uid);

  const { uid, collectionName } = data;

  // Validation
  if (!uid || !collectionName) {
    throw new functions.https.HttpsError('invalid-argument', 'Employee UID and collection name are required');
  }

  try {
    // Check if employee exists before deletion
    const employeeDoc = await db.collection(collectionName).doc(uid).get();
    if (!employeeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Employee not found');
    }

    const employeeData = employeeDoc.data();
    
    // Prevent self-deletion
    if (uid === context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot delete your own account');
    }

    // Delete from Firestore first
    await db.collection(collectionName).doc(uid).delete();
    console.log('Deleted employee from Firestore:', uid);

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(uid);
      console.log('Deleted user from Auth:', uid);
    } catch (authError) {
      console.log('User not found in Auth or already deleted:', authError.message);
    }

    // Log the deletion for audit purposes
    await db.collection('audit_logs').add({
      action: 'delete_employee',
      targetUid: uid,
      targetEmail: employeeData.email,
      targetName: employeeData.name,
      performedBy: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      collectionName
    });

    return { 
      success: true, 
      message: 'Employee deleted successfully',
      deletedEmployeeId: uid
    };

  } catch (error) {
    console.error('Error deleting employee:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete employee: ' + error.message);
  }
});

// Resend Invite Function
exports.resendInvite = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to resend invites');
  }

  // Manager verification
  await verifyManager(context.auth.uid);

  const { email, uid, collectionName } = data;

  // Validation
  if (!email || !uid || !collectionName) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, UID, and collection name are required');
  }

  try {
    // Check if employee exists
    const employeeDoc = await db.collection(collectionName).doc(uid).get();
    if (!employeeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Employee not found');
    }

    const employeeData = employeeDoc.data();

    // Verify email matches
    if (employeeData.email !== email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email does not match employee record');
    }

    // Generate new password reset link
    const resetLink = await auth.generatePasswordResetLink(email);
    console.log('Password reset link generated for:', email);

    // Update employee record
    await db.collection(collectionName).doc(uid).update({
      inviteSentAt: admin.firestore.FieldValue.serverTimestamp(),
      inviteLink: resetLink,
      inviteResentBy: context.auth.uid,
      inviteCount: admin.firestore.FieldValue.increment(1)
    });

    return { 
      success: true, 
      message: 'Invitation resent successfully',
      email: email
    };

  } catch (error) {
    console.error('Error resending invite:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new functions.https.HttpsError('not-found', 'User account not found');
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to resend invite: ' + error.message);
  }
});

// Deactivate Employee Function (Bonus)
exports.deactivateEmployee = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  await verifyManager(context.auth.uid);

  const { uid, collectionName } = data;

  if (!uid || !collectionName) {
    throw new functions.https.HttpsError('invalid-argument', 'UID and collection name required');
  }

  try {
    await db.collection(collectionName).doc(uid).update({
      status: 'Inactive',
      deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deactivatedBy: context.auth.uid
    });

    // Disable user in Firebase Auth
    try {
      await auth.updateUser(uid, { disabled: true });
    } catch (authError) {
      console.log('User not found in Auth:', authError.message);
    }

    return { success: true, message: 'Employee deactivated successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get Employee Details Function (Bonus)
exports.getEmployeeDetails = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  await verifyManager(context.auth.uid);

  const { uid, collectionName } = data;

  try {
    const employeeDoc = await db.collection(collectionName).doc(uid).get();
    if (!employeeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Employee not found');
    }

    return { 
      success: true, 
      employee: employeeDoc.data() 
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});