import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany} from "typeorm";
import {ContactRequest} from "./ContactRequest";
import {ContactResponse} from "./ContactResponse";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;
	
	@OneToMany(type => ContactRequest, contactRequest => contactRequest.user)
	contactRequests: ContactRequest[];
	
	@OneToMany(type => ContactResponse, contactResponse => contactResponse.user)
	contactResponses: ContactResponse[];

	@OneToMany(type => ContactResponse, contactResponse => contactResponse.recipient)
	recipientResponses: ContactResponse[];
	
	@ManyToMany(type => ContactRequest, contactRequest => contactRequest.usersResponded)
    ViewedRequests: ContactRequest[];

    @Column({
		type: "varchar",
		length: 32,
		unique: true
	})
    username: string;

    @Column({
		type: "varchar",
		length: 32,
		select: false
	})
    password: string;
	
	@Column({
		type: "timestamp",
		select: false
	})
    userCreateTime: number;
	
	@Column({
		type: "varchar",
		length: 32,
		nullable: true,
		select: false
	})
    sessionToken: string;
	
	@Column({
		type: "timestamp",
		nullable: true,
		select: false
	})
    sessionCreateTime: number;	
	
	
}
