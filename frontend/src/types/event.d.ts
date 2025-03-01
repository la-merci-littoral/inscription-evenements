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
}

export default Event;