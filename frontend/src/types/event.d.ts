interface Event {
    id: string;
    display_name: string;
    date_start: Date;
    date_end: Date;
    location: string;
    price_categories: {
        type: "member" | "minor" | "default";
        price: number;
        display: string;
    }[];
    order: number;
    limit: number;
    bookings_left: number;
    info_fields: ('name' | 'surname' | 'email' | 'phone' | 'attendants')[];
}

export default Event;