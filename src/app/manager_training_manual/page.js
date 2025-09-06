"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/app/firebaseConfig";
import SignaturePad from 'react-signature-canvas';

const sections = [
    { title: "Orientation", key: "orientation" },
    { title: "Shift Management", key: "shiftManagement" },
    { title: "Labor & Scheduling", key: "laborAndScheduling" },
    { title: "People & Leadership", key: "peopleAndLeadership" },
    { title: "Guest Experience", key: "guestExperience" },
    { title: "Menu & Product Knowledge", key: "menuAndProductKnowledge" },
    { title: "Sales & Reporting", key: "salesAndReporting" },
    { title: "Inventory & COGS", key: "inventoryAndCOGS" },
    { title: "Marketing & Events", key: "marketingAndEvents" },
    { title: "Cleanliness & Safety", key: "cleanlinessAndSafety" },
    { title: "Crisis Procedures", key: "crisisProcedures" },
    { title: "Technology Systems", key: "technologySystems" },
    { title: "Manager Updates", key: "managerupdates" },
    { title: "Acknowledgement", key: "acknowledgement" },
];

const ContentDisplay = ({ content }) => {
    if (!content) return null;
    return (
        <div className="space-y-3 text-gray-800 text-base">
            {content.map((item, index) => {
                switch (item.type) {
                    case 'headline':
                        return <h2 key={index} className="text-2xl font-bold text-green-800">{item.text}</h2>;
                    case 'bold':
                        return <p key={index} className="font-semibold text-green-700">{item.text}</p>;
                    case 'subheading':
                        return <h3 key={index} className="text-xl font-semibold mt-4 text-green-700">{item.text}</h3>;
                    case 'text':
                        return <p key={index}>{item.text}</p>;
                    case 'list':
                        return (
                            <ul key={index} className="list-disc list-inside ml-4">
                                {item.list.map((listItem, listIndex) => (
                                    <li key={listIndex}>{listItem}</li>
                                ))}
                            </ul>
                        );
                    case 'numberedList':
                        return (
                            <ol key={index} className="list-decimal list-inside ml-4">
                                {item.list.map((listItem, listIndex) => (
                                    <li key={listIndex}>
                                        <span className="font-semibold">{listItem.title}:</span> {listItem.text}
                                    </li>
                                ))}
                            </ol>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default function ManagerTraining() {
    const [pageIndex, setPageIndex] = useState(0);
    const [fullName, setFullName] = useState('');
    const [acknowledged, setAcknowledged] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState('');
    const signaturePadRef = useRef(null);
    const router = useRouter();

    const [manualData, setManualData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isAcknowledged, setIsAcknowledged] = useState(false);

    useEffect(() => {
        const fetchManualData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists() && userDocSnap.data().managerAcknowledgement) {
                        setIsAcknowledged(true);
                        setFullName(userDocSnap.data().managerAcknowledgement.fullName || '');
                        setSignatureDataUrl(userDocSnap.data().managerAcknowledgement.signatureData || '');
                    }
                }
                const docRef = doc(db, "Manager Manual", "data");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setManualData(docSnap.data());
                } else {
                    console.log("No such document!");
                    setManualData({});
                }
            } catch (error) {
                console.error("Error fetching document:", error);
                setManualData({});
            } finally {
                setLoading(false);
            }
        };
        fetchManualData();
    }, []);

    const handleClearSignature = () => {
        signaturePadRef.current.clear();
        setSignatureDataUrl('');
    };

    const handlePracticalSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to submit your acknowledgement.");
            router.push('/login');
            return;
        }
        if (signaturePadRef.current.isEmpty()) {
            alert('Please provide a signature by drawing on the canvas.');
            return;
        }
        if (!acknowledged) {
            alert('Please check the acknowledgement box to proceed.');
            return;
        }
        try {
            const userDocRef = doc(db, "users", user.uid);
            const acknowledgementData = {
                fullName: fullName,
                signatureData: signaturePadRef.current.toDataURL(),
                acknowledgedAt: serverTimestamp(),
            };
            await updateDoc(userDocRef, {
                managerAcknowledgement: acknowledgementData,
            });
            alert(`Thank you, ${fullName}, for acknowledging the Manager Training Handbook! Your data has been saved.`);
            setIsAcknowledged(true);
        } catch (error) {
            console.error("Error writing acknowledgement to Firestore:", error);
            alert("There was an error saving your acknowledgement. Please try again.");
        }
    };

    const currentContentKey = sections[pageIndex].key;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-600">
                <p className="text-xl text-green-800">Loading manager training manual...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <aside className="w-full md:w-64 p-4 flex flex-col text-white bg-gradient-to-br from-green-200 to-green-800 md:min-h-screen">
                <div className="mb-6 flex justify-center">
                    <Image
                        src="/logo.png"
                        alt="Oceanside Logo"
                        width={80}
                        height={80}
                        className="rounded-full"
                    />
                </div>
                <nav className="space-y-2 flex-grow">
                    <button
                        onClick={() => router.back()}
                        className="block w-full text-left font-semibold py-1 rounded"
                    >
                        <a className="flex items-center p-3 rounded-xl transition-colors duration-200 bg-green-800 hover:bg-green-700">
                            <span className="mr-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="white"
                                >
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                            </span>
                            <span className="font-semibold text-white">Manager Hub</span>
                        </a>
                    </button>
                    {sections.map((section, i) => (
                        <button
                            key={i}
                            onClick={() => setPageIndex(i)}
                            className={`block w-full text-left px-3 py-1 rounded hover:bg-green-200 ${
                                pageIndex === i ? "bg-green-300 font-bold" : ""
                            }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </nav>
            </aside>
            
            <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-gradient-to-br from-green-100 to-green-600">
                <div className="max-w-3xl mx-auto rounded-lg shadow-md p-6 md:p-8 bg-white">
                    {currentContentKey === 'acknowledgement' ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-green-800">Acknowledgement Form</h2>
                            <form onSubmit={handlePracticalSubmit} className="space-y-4">
                                <div className="text-sm text-gray-700">
                                    <p className="mb-2">I understand that as a Manager at Oceanside, I am responsible for:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Upholding Oceanside’s mission of warm hospitality, consistent quality, and an elevated guest experience.</li>
                                        <li>Following all policies, procedures, and leadership standards outlined in the training.</li>
                                        <li>Maintaining professionalism, accountability, and fairness as a representative of ownership during my shifts.</li>
                                        <li>Completing shift notes, reports, and required communication accurately and on time.</li>
                                        <li>Supporting my team through coaching, accountability, and leadership.</li>
                                    </ul>
                                    <p className="mt-4">
                                        I also understand that Oceanside may update policies or procedures as needed, and I am responsible for staying informed of these updates.
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        checked={acknowledged}
                                        onChange={(e) => setAcknowledged(e.target.checked)}
                                        className="h-4 w-4 mt-1 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        required
                                        disabled={isAcknowledged}
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                     By signing this form, I confirm that I have received, reviewed, 
                                    and agree to follow Oceanside’s Manager Training guidelines.</label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mt-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        required
                                        disabled={isAcknowledged}
                                    />
                                </div>
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Signature <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-col space-y-4">
                                        <div className="border border-gray-300 rounded-md p-2">
                                            <div className="relative h-32 bg-white">
                                                <SignaturePad
                                                    ref={signaturePadRef}
                                                    canvasProps={{
                                                        className: `w-full h-full border border-gray-200 rounded-md ${isAcknowledged ? 'cursor-not-allowed' : 'cursor-crosshair'}`,
                                                    }}
                                                    clearOnResize={false}
                                                    onEnd={() => setSignatureDataUrl(signaturePadRef.current.toDataURL())}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleClearSignature}
                                                className="mt-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                                                disabled={isAcknowledged}
                                            >
                                                Clear Signature
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-6 disabled:opacity-50"
                                    disabled={isAcknowledged}
                                >
                                    {isAcknowledged ? 'Already Acknowledged' : 'Submit'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <ContentDisplay content={manualData[currentContentKey]} />
                            <div className="flex items-center justify-between my-4">
                                <button
                                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                                    disabled={pageIndex === 0}
                                    className="flex items-center gap-1 text-green-700 disabled:opacity-30"
                                >
                                    <ChevronLeft /> Previous
                                </button>
                                <div className="flex-1 border-t mx-4 border-gray-300" />
                                <button
                                    onClick={() => setPageIndex((p) => Math.min(sections.length - 1, p + 1))}
                                    disabled={pageIndex === sections.length - 1}
                                    className="flex items-center gap-1 text-green-700 disabled:opacity-30"
                                >
                                    Next <ChevronRight />
                                </button>
                            </div>
                            <div className="text-center text-sm text-gray-500">
                                Page {pageIndex + 1} of {sections.length}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}