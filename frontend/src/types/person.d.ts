import type Event from '@/types/event'

interface Person {
    name: string;
    surname: string;
    fullName: string;
    birth: string | Date;
    email: string;
    phone: string;
    attendants: number;
    selectedEvent: Event;
    verifiedCategories: Event['price_categories'];
    bestPriceCategory: Event['price_categories'][0];
    member_id: number;
    booking_id: number;
    pi_secret: string;
}

export default Person;