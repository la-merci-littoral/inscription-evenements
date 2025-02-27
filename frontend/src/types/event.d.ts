interface Event {
    id: string;
    display_name: string;
    date_start: Date;
    date_end: Date;
    location: string;
    prices: {
        member: number;
        non_member: number;
    }
}

export default Event;