export declare const UserRole: {
    readonly USER: "USER";
    readonly ORGANIZER: "ORGANIZER";
    readonly ADMIN: "ADMIN";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const EventStatus: {
    readonly DRAFT: "DRAFT";
    readonly PUBLISHED: "PUBLISHED";
    readonly CANCELLED: "CANCELLED";
};
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];
export declare const BookingStatus: {
    readonly PENDING: "PENDING";
    readonly PAID: "PAID";
    readonly CANCELLED: "CANCELLED";
};
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
