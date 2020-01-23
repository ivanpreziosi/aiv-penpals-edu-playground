import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable} from "typeorm";
import {User} from "./User";
import {ContactResponse} from "./ContactResponse";

@Entity()
export class ContactRequest {

    @PrimaryGeneratedColumn()
	id: number;
	
	@OneToMany(type => ContactResponse, contactResponse => contactResponse.contactRequest)
	contactResponses: ContactResponse[];
	
	
	@ManyToMany(type => User)
    @JoinTable()
    usersResponded: User[];

    @ManyToOne(type => User, user => user.contactRequests)
    user: User;

    @Column({
		type: "text",
	})
	requestTitle: string;
	
	@Column({
		type: "text",
	})
    requestText: string;
	
	@Column({
		type: "timestamp",
	})
    requestCreateTime: number;
	
	@Column({
		type: "tinyint",
		nullable: false,
		default: '1'
	})
	isActive: number;

	
}
