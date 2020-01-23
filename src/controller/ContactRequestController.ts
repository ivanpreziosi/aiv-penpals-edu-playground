import { getCustomRepository, getRepository } from "typeorm";
import { Request, Response } from "express";
import { ContactRequest } from "../entity/ContactRequest";
import { UserRepository } from "../repository/UserRepository";
import { ContactRequestRepository } from "../repository/ContactRequestRepository";
import { MoreThanOrEqual } from "typeorm";
var DefaultResponse = require('../tpl/DefaultResponse');
var DateHelper = require('../helper/PenpalsDateUtils');

export class ContactRequestController {

    private userRepository = getCustomRepository(UserRepository);
    private contactRequestRepository = getCustomRepository(ContactRequestRepository);

    /**
    // get my requests GET
    **/
    async mine(request: Request, response: Response) {
        try {
            //get current user 
            let hUsername = request.header('username');
            const loggedUser = await this.userRepository.findByUsername(hUsername);
            console.log(loggedUser);
            //get requests
            const result = await this.contactRequestRepository.find({ where: { user: loggedUser, requestCreateTime: MoreThanOrEqual(DateHelper.getRequestExpirationDate().toString()) } });

            return result;
        } catch (e) {
            return e;
        }

    }

    /**
    // get a single request GET
    **/
    async single(request: Request, response: Response) {
        try {
            //get request
            const result = await this.contactRequestRepository.findOne({
                join: {
                    alias: "req",
                    leftJoinAndSelect: {
                        user: "req.user"
                    }
                },
                where: { id: request.params.reqId }
            });

            return result;
        } catch (e) {
            return e;
        }

    }

    /**
   // get others requests GET
   **/
    async all(request: Request, response: Response) {
        try {
            //get current user 
            let hUsername = request.header('username');
            let hToken = request.header(require('../app_config').appTokenName);
            const loggedUser = await this.userRepository.findByUsername(hUsername);

            //get requests
            const result = await this.contactRequestRepository.getUnrespondedRequests(loggedUser);            

            return {
                status: "OK",
                code: "GET-REQUESTS",
                message: "Contact requests succesfully fetched",
                payload: result
            };
        } catch (e) {
            return e;
        }

    }

    /**
    // get a user's requests GET
    **/
    async user(request: Request, response: Response) {
        try {
            //get requests
            const result = await this.contactRequestRepository.find({
                join: {
                    alias: "req",
                    leftJoinAndSelect: {
                        user: "req.user"
                    }
                },
                where: { user: request.params.userId, requestCreateTime: MoreThanOrEqual(DateHelper.getRequestExpirationDate().toString()) }
            })
            return result;
        } catch (e) {
            return e;
        }

    }

    /**
    // Save ContactRequest POST
    **/
    async save(request: Request, response: Response) {
        //get current user 
        let hUsername = request.header('username');
        let hToken = request.header(require('../app_config').appTokenName);

        const loggedUser = await this.userRepository.findByUsername(hUsername);


        // VALIDATE DATA
        const Joi = require('@hapi/joi');

        const schema = Joi.object({
            requestText: Joi.string()
                .required(),
            requestTitle: Joi.string()
                .required(),
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

        //create model        
        let contactRequest = new ContactRequest();
        contactRequest.user = loggedUser;
        contactRequest.requestTitle = request.body.requestTitle;
        contactRequest.requestText = request.body.requestText;
        contactRequest.usersResponded= [loggedUser];

        //save model          
        try {
            let result = await this.contactRequestRepository.save(contactRequest);
            console.log(result);
            DefaultResponse.responseData.status = "OK";
            DefaultResponse.responseData.code = "CONTACT-REQUEST-SAVED";
            DefaultResponse.responseData.message = "Request saved successfully.";
        } catch (e) {
            console.log(e);
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = e.code;
            DefaultResponse.responseData.message = e.message;
            response.set('status', 418);
        }
        return DefaultResponse.responseData;
    }



}