import { getCustomRepository, getRepository } from "typeorm";
import { Request, Response } from "express";
import { ContactRequest } from "../entity/ContactRequest";
import { ContactResponse } from "../entity/ContactResponse";
import { UserRepository } from "../repository/UserRepository";
import { ContactResponseRepository } from "../repository/ContactResponseRepository";
import { ContactRequestRepository } from "../repository/ContactRequestRepository";
import { MoreThanOrEqual } from "typeorm";
import { Not } from "typeorm";
var DefaultResponse = require('../tpl/DefaultResponse');
var DateHelper = require('../helper/PenpalsDateUtils');

export class ContactResponseController {

    private userRepository = getCustomRepository(UserRepository);
    private contactRequestRepository = getCustomRepository(ContactRequestRepository);
    private contactResponseRepository = getCustomRepository(ContactResponseRepository);

    /**
    // get my responses GET
    **/
    async request(request: Request, response: Response) {
        try {

            //get requests
            const result = await this.contactResponseRepository.find({
                where: {
                    request_create_time: MoreThanOrEqual(DateHelper.getRequestExpirationDate().toString()),
                    contactRequest: request.params.reqId
                }
            });

            return result;
        } catch (e) {
            return e;
        }

    }


    async deliver(request: Request, response: Response) {
        //get current user 
        let hUsername = request.header('username');
        let hToken = request.header(require('../app_config').appTokenName);

        const loggedUser = await this.userRepository.findByUsername(hUsername);

        // VALIDATE DATA
        const Joi = require('@hapi/joi');

        const schema = Joi.object({
            responseId: Joi.number()
                .integer()
                .required()
        })

        let validation = schema.validate(request.body);

        if (validation.error != null && validation.error != undefined) {
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = "DATA-VALIDATION";
            for (var ii = 0; ii < validation.error.details.length; ii++) {
                DefaultResponse.responseData.message = validation.error.details[ii].message + " ** ";
            }
            response.set('status', 400);
            return DefaultResponse.responseData;
        }

        try{

            var contactResponse = await this.contactResponseRepository.findOne({
                where: {
                    id: request.body.responseId
                }
            });

            contactResponse.isDelivered = 1;
            await this.contactResponseRepository.save(contactResponse);

            DefaultResponse.responseData.status = "OK";
            DefaultResponse.responseData.code = "CONTACT-RESPONSE-DELIVERED";
            DefaultResponse.responseData.message = "Contact response delivered successfully.";


        } catch (e) {
            console.log(e);
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = e.code;
            DefaultResponse.responseData.message = e.message;
            response.set('status', 418);
            return DefaultResponse.responseData;
        }

        return DefaultResponse.responseData;

    }


    /**
    // Save ContactResponse POST
    **/
    async save(request: Request, response: Response) {
        //get current user 
        let hUsername = request.header('username');
        let hToken = request.header(require('../app_config').appTokenName);

        const loggedUser = await this.userRepository.findByUsername(hUsername);


        // VALIDATE DATA
        const Joi = require('@hapi/joi');

        const schema = Joi.object({
            responseText: Joi.string()
                .required(),
            requestId: Joi.number()
                .integer()
                .required(),
            recipientId: Joi.number()
                .integer()
                .required()
        })

        let validation = schema.validate(request.body);

        if (validation.error != null && validation.error != undefined) {
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = "DATA-VALIDATION";
            for (var ii = 0; ii < validation.error.details.length; ii++) {
                DefaultResponse.responseData.message = validation.error.details[ii].message + " ** ";
            }
            response.set('status', 400);
            return DefaultResponse.responseData;
        }
        /////////////////////////////////////////////////////////////////////////

        
        try {
            //load contact request
            var contactRequest = await this.contactRequestRepository.findOne({
                where: {
                    id: request.body.requestId
                },
                relations: ["usersResponded"]
            });

            // load recipient user
            const recipientUser = await this.userRepository.findOne(parseInt(request.body.recipientId));

            //create contact response
            let contactResponse = new ContactResponse();
            contactResponse.user = loggedUser;
            contactResponse.responseText = request.body.responseText;
            contactResponse.contactRequest = contactRequest;
            contactResponse.recipient = recipientUser;
            const result = await this.contactResponseRepository.save(contactResponse);

            //set this request as delivered for this user
            console.log("contactRequest.usersResponded");
            console.log(contactRequest.usersResponded);
            let usersResponded = contactRequest.usersResponded;
            usersResponded.push(loggedUser);
            console.log(usersResponded);
            contactRequest.usersResponded = usersResponded;
            console.log(contactRequest.usersResponded);
            await this.contactRequestRepository.save(contactRequest);
            ////////////////////////////////////////////////

            DefaultResponse.responseData.status = "OK";
            DefaultResponse.responseData.code = "CONTACT-RESPONSE-SAVED";
            DefaultResponse.responseData.message = "Contact response saved successfully.";
        } catch (e) {
            console.log(e);
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = e.code;
            DefaultResponse.responseData.message = e.message;
            response.set('status', 418);
            return DefaultResponse.responseData;
        }

        return DefaultResponse.responseData;
    }

}