'use client';
import React from 'react';

// Client ka diya hua Google Calendar embed code
const GOOGLE_CALENDAR_EMBED_SRC = "https://calendar.google.com/calendar/embed?src=eventsatoceanside%40gmail.com&ctz=America%2FNew_York";

const CalendarEmbedOnly = () => {
  return (
    // Ek basic container jo Next.js/React component ki tarah kaam karega.
    // Ismein koi custom background ya styling nahi hai.
    <div className="w-full h-screen p-0 m-0">
        
      {/* Google Calendar Iframe: Use the client's original dimensions for max width/height */}
      <iframe
        src={GOOGLE_CALENDAR_EMBED_SRC}
        style={{ border: '0' }}
        width="100%" // Full width
        height="100%" // Full height of the parent div
        frameBorder="0"
        scrolling="no"
        title="Google Events Calendar"
      ></iframe>

    </div>
  );
};

export default CalendarEmbedOnly;