interface Person {
    name: string;
    surname: string;
    birth: string | Date;
    email: string;
    phone: string;
    event_id: string;
    price_category: string;
    price: number;
    member_id: number;
    pi_secret: string;
}

export default Person;