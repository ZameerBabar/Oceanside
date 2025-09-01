// seatingData.js

export const seatingData = {
  flagler: {
    name: 'Flagler',
    totalTables: 101
  },
  ormond: {
    name: 'Ormond',
    totalTables: 58
  }
};

export const getTableData = (location) => {
  if (location === 'ormond') {
    return [
      // Top row - Building area (3 rectangles) - Outside Section
      { id: 303, number: 303, x: 355, y: 105, shape: 'rectangle', width: 50, height: 30 },
      { id: 302, number: 302, x: 455, y: 105, shape: 'rectangle', width: 50, height: 30 },
      { id: 301, number: 301, x: 555, y: 105, shape: 'rectangle', width: 50, height: 30 },

      // Outside Section - Second row from top
      { id: 212, number: 212, x: 160, y: 220, shape: 'diamond', width: 35, height: 35 },
      { id: 211, number: 211, x: 220, y: 220, shape: 'diamond', width: 35, height: 35 },
      { id: 210, number: 210, x: 280, y: 215, shape: 'rectangle', width: 30, height: 50 },
      { id: 209, number: 209, x: 340, y: 215, shape: 'rectangle', width: 30, height: 50 },
      { id: 208, number: 208, x: 400, y: 220, shape: 'diamond', width: 35, height: 35 },
      { id: 207, number: 207, x: 460, y: 215, shape: 'rectangle', width: 30, height: 50 },
      { id: 206, number: 206, x: 520, y: 220, shape: 'diamond', width: 35, height: 35 },
      { id: 205, number: 205, x: 580, y: 220, shape: 'rectangle', width: 50, height: 30 },
      { id: 204, number: 204, x: 640, y: 220, shape: 'diamond', width: 35, height: 35 },
      { id: 203, number: 203, x: 700, y: 215, shape: 'rectangle', width: 30, height: 50 },
      { id: 202, number: 202, x: 760, y: 220, shape: 'diamond', width: 35, height: 35 },
      { id: 201, number: 201, x: 820, y: 215, shape: 'rectangle', width: 30, height: 50 },

      // Outside Section - Bottom row of diamonds
      { id: 112, number: 112, x: 120, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 111, number: 111, x: 170, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 110, number: 110, x: 220, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 109, number: 109, x: 290, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 108, number: 108, x: 380, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 107, number: 107, x: 435, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 106, number: 106, x: 520, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 105, number: 105, x: 580, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 104, number: 104, x: 660, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 103, number: 103, x: 720, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 102, number: 102, x: 800, y: 370, shape: 'diamond', width: 35, height: 35 },
      { id: 101, number: 101, x: 850, y: 370, shape: 'diamond', width: 35, height: 35 },

      // Inside Section - Top row of squares (near server station)
      { id: 55, number: 55, x: 100, y: 472, shape: 'square', width: 40, height: 60 },
      { id: 54, number: 54, x: 180, y: 472, shape: 'square', width: 40, height: 60 },
      { id: 53, number: 53, x: 260, y: 472, shape: 'square', width: 40, height: 60 },
      { id: 41, number: 41, x: 480, y: 472, shape: 'square', width: 40, height: 60 },
      { id: 42, number: 42, x: 560, y: 472, shape: 'square', width: 40, height: 60 },
      { id: 43, number: 43, x: 640, y: 472, shape: 'square', width: 40, height: 60 },

      // Left side bar area - circles
      { id: 68, number: 68, x: 105, y: 540, shape: 'circle', width: 30, height: 30 },
      { id: 67, number: 67, x: 105, y: 580, shape: 'circle', width: 30, height: 30 },
      { id: 66, number: 66, x: 105, y: 620, shape: 'circle', width: 30, height: 30 },
      { id: 65, number: 65, x: 105, y: 660, shape: 'circle', width: 30, height: 30 },
      { id: 64, number: 64, x: 105, y: 700, shape: 'circle', width: 30, height: 30 },
      { id: 63, number: 63, x: 105, y: 740, shape: 'circle', width: 30, height: 30 },
      { id: 62, number: 62, x: 105, y: 780, shape: 'circle', width: 30, height: 30 },
      { id: 61, number: 61, x: 105, y: 820, shape: 'circle', width: 30, height: 30 },

      // Middle left area - diamonds
      { id: 56, number: 56, x: 185, y: 580, shape: 'diamond', width: 35, height: 35 },
      { id: 52, number: 52, x: 260, y: 580, shape: 'diamond', width: 35, height: 35 },
      { id: 57, number: 57, x: 185, y: 670, shape: 'diamond', width: 35, height: 35 },
      { id: 51, number: 51, x: 260, y: 670, shape: 'diamond', width: 35, height: 35 },

      // Middle right area - squares (31-34)
      { id: 31, number: 31, x: 480, y: 570, shape: 'square', width: 40, height: 60 },
      { id: 32, number: 32, x: 560, y: 570, shape: 'square', width: 40, height: 60 },
      { id: 33, number: 33, x: 640, y: 570, shape: 'square', width: 40, height: 60 },
      { id: 34, number: 34, x: 720, y: 570, shape: 'square', width: 40, height: 60 },

      // Middle section - diamonds (21-24)
      { id: 21, number: 21, x: 470, y: 670, shape: 'diamond', width: 40, height: 40 },
      { id: 22, number: 22, x: 560, y: 670, shape: 'diamond', width: 40, height: 40 },
      { id: 23, number: 23, x: 650, y: 670, shape: 'diamond', width: 40, height: 40 },
      { id: 24, number: 24, x: 740, y: 670, shape: 'diamond', width: 40, height: 40 },

      // Bottom row - squares (11-14)
      { id: 11, number: 11, x: 450, y: 780, shape: 'square', width: 40, height: 60 },
      { id: 12, number: 12, x: 550, y: 780, shape: 'square', width: 40, height: 60 },
      { id: 13, number: 13, x: 650, y: 780, shape: 'square', width: 40, height: 60 },
      { id: 14, number: 14, x: 750, y: 780, shape: 'square', width: 40, height: 60 },

      // Single table at bottom left
      { id: 58, number: 58, x: 200, y: 780, shape: 'rectangle', width: 40, height: 60 },

    ];
  } 
  
  
  
  
  
  else if (location === 'flagler') {
    return [
    // 2nd Level Front and Middle Section
    // Upstairs Bar Seats (Left side - Circles)
    { id: '101', number: 501, x: 85, y: 70, width: 30, height: 30, isCircle: true },
    { id: '102', number: 502, x: 85, y: 110, width: 30, height: 30, isCircle: true },
    { id: '103', number: 503, x: 85, y: 150, width: 30, height: 30, isCircle: true },
    { id: '104', number: 504, x: 85, y: 190, width: 30, height: 30, isCircle: true },
    { id: '105', number: 505, x: 85, y: 230, width: 30, height: 30, isCircle: true },
    { id: '106', number: 506, x: 85, y: 270, width: 30, height: 30, isCircle: true },
    { id: '107', number: 507, x: 85, y: 310, width: 30, height: 30, isCircle: true },
    { id: '108', number: 508, x: 85, y: 350, width: 30, height: 30, isCircle: true },
    { id: '109', number: 509, x: 85, y: 390, width: 30, height: 30, isCircle: true },
    { id: '110', number: 510, x: 85, y: 430, width: 30, height: 30, isCircle: true },
    { id: '111', number: 511, x: 85, y: 470, width: 30, height: 30, isCircle: true },

    // Front Deck Tables (Center area)
    { id: '401', number: 306, x: 200, y: 100, width: 40, height: 40, isDiamond: true },
    { id: '402', number: 305, x: 320, y: 100, width: 40, height: 40, isDiamond: true },
    { id: '403', number: 304, x: 440, y: 100, width: 40, height: 40, isDiamond: true },
    { id: '404', number: 303, x: 580, y: 100, width: 40, height: 40, isDiamond: true },

   // { id: '301', number: 301, x: 400, y: 160, width: 50, height: 30, isRectangle: true },
    { id: '302', number: 403, x: 320, y: 180, width: 40, height: 40, isRectangle: true },
    { id: '303', number: 402, x: 420, y: 180, width: 40, height: 40, isRectangle: true },
   // { id: '304', number: 304, x: 430, y: 160, width: 50, height: 30, isRectangle: true },

    { id: '305', number: 404, x: 320, y: 240, width: 40, height: 40, isRectangle: true },
    { id: '306', number: 401, x: 420, y: 240, width: 40, height: 40, isRectangle: true },

    // Middle Deck Tables (Right side)
    { id: '501', number: 302, x: 580, y: 160, width: 40, height: 55, isDiamond: true },
    { id: '502', number: 301, x: 580, y: 230, width: 40, height: 40, isDiamond: true },
    { id: '503', number: 601, x: 580, y: 300, width: 40, height: 40, isDiamond: true },
    { id: '504', number: 602, x: 580, y: 370, width: 40, height: 40, isDiamond: true },
    { id: '505', number: 603, x: 580, y: 430, width: 40, height: 55, isDiamond: true },
    { id: '506', number: 604, x: 580, y: 500, width: 40, height: 40, isDiamond: true },

    // Stairs area (Far right)
    { id: '507', number: 701, x: 750, y: 280, width: 40, height: 40, isDiamond: true },
    { id: '508', number: 702, x: 750, y: 350, width: 40, height: 40, isDiamond: true },
    { id: '509', number: 703, x: 750, y: 420, width: 40, height: 40, isDiamond: true },
    { id: '510', number: 704, x: 750, y: 490, width: 40, height: 40, isDiamond: true },

   
   

    // Left side diamonds
    { id: '201', number: 307, x: 200, y: 170, width: 40, height: 50, isDiamond: true },
    { id: '202', number: 308, x: 200, y: 260, width: 40, height: 40, isDiamond: true },

    // 2nd Level Back Deck and Banquet Section
    // Back Deck diamond tables (Right side)
    { id: '601', number: 801, x: 600, y: 620, width: 40, height: 40, isDiamond: true },
    { id: '602', number: 901, x: 730, y: 620, width: 40, height: 40, isDiamond: true },
    { id: '603', number: 902, x: 730, y: 690, width: 40, height: 40, isDiamond: true },
    
    { id: '604', number: 802, x: 600, y: 700, width: 40, height: 40, isDiamond: true },
    { id: '605', number: 903, x: 730, y: 760, width: 40, height: 40, isDiamond: true },
    { id: '606', number: 803, x: 600, y: 770, width: 40, height: 40, isDiamond: true },
    { id: '607', number: 804, x: 600, y: 840, width: 40, height: 40, isDiamond: true },

    // Banquet Room tables (Left side)
    { id: '701', number: 1001, x: 5, y: 705, width: 60, height: 40, isRectangle: true },
    { id: '702', number: 1002, x: 5, y: 910, width: 60, height: 40, isRectangle: true },

    // Downstairs Inside Section
    // Main floor tables (squares and rectangles)
   { id: '801', number: 42, x: 50, y: 1270, width: 40, height: 40, isRectangle: true },
    { id: '802', number: 41, x: 170, y: 1270, width: 40, height: 40, isRectangle: true },

    { id: '803', number: 43, x: 50, y: 1330, width: 40, height:40, isRectangle: true },
    { id: '804', number: 44, x: 170, y: 1330, width: 40, height: 40, isRectangle: true },

    // Center tables
    { id: '805', number: 34, x: 230, y: 1180, width: 40, height: 60, isRectangle: true },
   { id: '806', number: 33, x: 330, y: 1180, width: 40, height: 60, isRectangle: true },
    { id: '807', number: 32, x: 430, y: 1180, width: 40, height: 60, isRectangle: true },
     { id: '511', number: 31, x: 530, y: 1180, width: 40, height: 60, isRectangle: true },

   { id: '808', number: 53, x: 50, y: 1400, width: 40, height: 40, isRectangle: true },
    { id: '809', number: 52, x: 170, y: 1400, width: 40, height: 40, isRectangle: true },
    { id: '810', number: 51, x: 290, y: 1400, width: 40, height: 40, isRectangle: true },

    { id: '811', number: 54, x: 50, y: 1450, width: 40, height: 40, isRectangle: true },
    { id: '812', number: 55, x: 170, y: 1450, width: 40, height: 40, isRectangle: true },
    { id: '813', number: 56, x: 290, y: 1450, width: 40, height: 40, isRectangle: true },

    // Upper area tables
    { id: '814', number: 23, x: 200, y: 1120, width: 40, height: 40, isRectangle: true },
    { id: '815', number: 22, x: 350, y: 1120, width: 40, height: 40, isRectangle: true },
    { id: '816', number: 21, x: 500, y: 1120, width: 40, height: 40, isRectangle: true },

    { id: '817', number: 16, x: 200, y: 1053, width: 40, height: 40, isRectangle: true },
    { id: '818', number: 15, x: 350, y: 1053, width: 40, height: 40, isRectangle: true },
    { id: '819', number: 14, x: 500, y: 1053, width: 40, height: 40, isRectangle: true },

    // Corner diamonds
    { id: '820', number: 17, x: 110, y: 1100, width: 35, height: 35, isDiamond: true },
    { id: '821', number: 18, x: 50, y: 1170, width: 35, height: 35, isDiamond: true },
    { id: '822', number: 13, x: 600, y: 1100, width: 35, height: 35, isDiamond: true },
    { id: '823', number: 12, x: 660, y: 1170, width: 35, height: 35, isDiamond: true },

    { id: '824', number: 11, x: 695, y: 1230, width: 35, height: 35, isRectangle: true },

    // Inside Bar area (circles)
    { id: '825', number: 66, x: 450, y: 1410, width: 30, height: 30, isCircle: true },
    { id: '826', number: 65, x: 510, y: 1410, width: 30, height: 30, isCircle: true },
    { id: '827', number: 64, x: 570, y: 1410, width: 30, height: 30, isCircle: true },
    { id: '828', number: 63, x: 630, y: 1410, width: 30, height: 30, isCircle: true },
    { id: '829', number: 62, x: 700, y: 1410, width: 30, height: 30, isCircle: true },
    { id: '830', number: 61, x: 760, y: 1410, width: 30, height: 30, isCircle: true },
    { id: '831', number: 67, x: 450, y: 1460, width: 30, height: 30, isCircle: true },

    // Downstairs Outside Section
    // Front Patio tables
    { id: '901', number: 99, x: 50, y: 1610, width: 35, height: 35, isRectangle: true },
    { id: '902', number: 98, x: 120, y: 1610, width: 35, height: 35, isRectangle: true },
  { id: '903', number: 97, x: 190, y: 1610, width: 35, height: 35, isRectangle: true },
    { id: '904', number: 96, x: 260, y: 1610, width: 35, height: 35, isRectangle: true },
    { id: '905', number: 95, x: 340, y: 1610, width: 35, height: 35, isRectangle: true },
    { id: '906', number: 94, x: 410, y: 1610, width: 35, height: 35, isRectangle: true },
    { id: '907', number: 93, x: 480, y: 1610, width: 35, height: 35, isRectangle: true },

    // Lower row
    { id: '908', number: 106, x: 140, y: 1680, width: 35, height: 35, isRectangle: true },
    { id: '909', number: 105, x: 200, y: 1680, width: 35, height: 35, isRectangle: true },
    { id: '910', number: 104, x: 260, y: 1680, width: 35, height: 35, isRectangle: true },
    { id: '911', number: 103, x: 320, y: 1680, width: 35, height: 35, isRectangle: true },
    
    { id: '912', number: 92.5, x: 440, y: 1700, width: 40, height: 70, isRectangle: true },
    { id: '913', number: 92, x: 530, y: 1700, width: 40, height: 40, isRectangle: true },

   { id: '914', number: 91.5, x: 440, y: 1790, width: 40, height: 40, isRectangle: true },
    { id: '915', number: 91, x: 530, y: 1780, width: 40, height: 70, isRectangle: true },

    // Diamond tables in patio
   { id: '916', number: 107, x: 80, y: 1720, width: 35, height: 35, isDiamond: true },
   { id: '917', number: 102, x: 340, y: 1770, width: 35, height: 35, isDiamond: true },
   { id: '918', number: 101, x: 340, y: 1840, width: 35, height: 35, isDiamond: true },

    // Side Covered Patio (Right side)
     { id: '512', number: 71, x: 670, y: 1600, width: 45, height: 45, isRectangle: true },
    { id: '919', number: 72, x: 670, y: 1660, width: 45, height: 45, isRectangle: true },
    { id: '920', number: 81, x: 810, y: 1640, width: 35, height: 35, isRectangle: true },

    { id: '921', number: 73, x: 670, y: 1720, width: 45, height: 45, isRectangle: true },
    { id: '922', number: 82, x: 810, y: 1700, width: 35, height: 35, isRectangle: true },

    { id: '923', number: 74, x: 670, y: 1780, width: 45, height: 45, isRectangle: true },
    { id: '924', number: 83, x: 810, y: 1760, width: 35, height: 35, isRectangle: true },

    { id: '925', number: 75, x: 670, y: 1840, width: 45, height: 45, isRectangle: true },
    { id: '926', number: 76, x: 670, y: 1900, width: 45, height: 45, isRectangle: true },
    { id: '927', number: 84, x: 810, y: 1820, width: 35, height: 35, isRectangle: true },
    { id: '928', number: 85, x: 810, y: 1880, width: 35, height: 35, isRectangle: true }
  ];
  }
  return [];
};