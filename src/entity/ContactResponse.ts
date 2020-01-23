import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { ContactRequest } from "./ContactRequest";

@Entity()
export class ContactResponse {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => ContactRequest, contactRequest => contactRequest.contactResponses, {
        nullable: false
    })
    contactRequest: ContactRequest;

    @ManyToOne(type => User, user => user.contactRequests, {
        nullable: false
    })
    user: User;

    @ManyToOne(type => User, user => user.recipientResponses, {
        nullable: false
    })
    recipient: User;

    @Column({
        type: "text",
    })
    responseText: string;

    @Column({
        type: "timestamp",
    })
    resposeCreateTime: number;

    @Column({
        type: "tinyint",
        nullable: false,
        default: '1'
    })
    isActive: number;

    @Column({
        type: "tinyint",
        nullable: false,
        default: '0'
    })
    isDelivered: number;


}
