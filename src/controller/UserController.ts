// import typeorm functions
//import { getRepository } from "typeorm";
import { getCustomRepository } from "typeorm";
//import { Not, In, MoreThanOrEqual } from "typeorm";

//entities
import { User } from "../entity/User";
import { UserRepository } from "../repository/UserRepository";
import { ContactRequestRepository } from "../repository/ContactRequestRepository";
import { ContactResponseRepository } from "../repository/ContactResponseRepository";

//express
import { NextFunction, Request, Response } from "express";

//utilities
import { Md5 } from "md5-typescript";
var DefaultResponse = require('../tpl/DefaultResponse');
//app config
var AppConfig = require('../app_config');


export class UserController {

    //orm entities repo
    private userRepository = getCustomRepository(UserRepository);
    private contactRequestRepository = getCustomRepository(ContactRequestRepository);
    private contactResponseRepository = getCustomRepository(ContactResponseRepository);

	/**
    // retrieve user profile GET
    **/
    async profile(request: Request, response: Response) {
        try {
            let hUsername = request.header('username');
            console.log("await this.userRepository.findByUsername");
            const user = await this.userRepository.findByUsername(hUsername);

            console.log("await this.contactRequestRepository.getUnrespondedRequests");
            const undeliveredRequests = await this.contactRequestRepository.getUnrespondedRequests(user);

            console.log("await this.contactResponseRepository.getUndeliveredResponses");
            const undeliveredReponses = await this.contactResponseRepository.getUndeliveredResponses(user);

            console.log("await this.contactResponseRepository.getUnreadResponses");
            const unreadResponses = await this.contactResponseRepository.getUnreadResponses(user);

            return {
                status: "OK",
                code: "DASHBOARD-INFO",
                message: "Dashboard info succesfully obtained.",
                user: user,
                newRequests: undeliveredRequests,
                undeliveredReponses: undeliveredReponses,
                unreadResponses: unreadResponses
            };
        } catch (e) {
            return {
                status: "KO",
                code: "DASHBOARD-INFO-ERROR",
                message: e.message
            };
        }

    }

    /**
    // Save user POST
    **/
    async save(request: Request, response: Response) {
        // VALIDATE DATA
        const Joi = require('@hapi/joi');

        //declare validation schema
        const schema = Joi.object({
            username: Joi.string()
                .alphanum()
                .min(3)
                .max(32)
                .required(),

            password: Joi.string()
                .pattern(/^[a-zA-Z0-9]{3,30}$/)
                .min(6)
                .max(32)
                .required(),

            repeat_password: Joi.ref('password'),
        })

        let validation = schema.validate(request.body);

        //validation gone bad
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
        let user = new User();
        user.username = request.body.username;
        user.password = Md5.init(request.body.password);
        this.userRepository.SetToken(request,user);

        //save model          
        try {
            let result = await this.userRepository.save(user);
            console.log(result);
            DefaultResponse.responseData.status = "OK";
            DefaultResponse.responseData.code = "USER-SAVED";
            DefaultResponse.responseData.message = "User saved successfully.";
            response.set('status', 201);
            //response.set(AppConfig.appTokenName,user.session_token);
        } catch (e) {
            console.log(e);
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = e.code;
            DefaultResponse.responseData.message = e.message;
            response.set('status', 418);
        }
        return DefaultResponse.responseData;

    }

	/**
    // login user GET
    **/
    async login(request: Request, response: Response) {
        // VALIDATE DATA
        const Joi = require('@hapi/joi');

        const schema = Joi.object({
            username: Joi.string()
                .alphanum()
                .min(3)
                .max(32)
                .required(),

            password: Joi.string()
                .pattern(/^[a-zA-Z0-9]{3,30}$/)
                .min(6)
                .max(32)
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

        //find user in db
        try {
            let result = await this.userRepository.find({
                select: ['id', 'username', 'sessionToken'],
                where: [
                    { username: request.body.username, password: Md5.init(request.body.password) }
                ]
            });
            if (result.length < 1) {
                throw {
                    code: "LOGIN-ERROR",
                    message: "Login unsuccesfull, check your credentials."
                };
            } else {
                let user = result[0];
                this.userRepository.SetToken(request,user);
                await this.userRepository.save(user);
                console.log(user);
                DefaultResponse.responseData.status = "OK";
                DefaultResponse.responseData.code = "USER-LOGGED-IN";
                DefaultResponse.responseData.message = "User logged in successfully.";
                DefaultResponse.responseData.payload = {
                    id: user.id,
                    username: user.username,
                    authTokencontrolToken: Md5.init(user.username + user.sessionToken)
                };
                response.set('status', 200);
                response.set(AppConfig.appTokenName, user.sessionToken);
            }
        } catch (e) {
            console.log(e);
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = e.code;
            DefaultResponse.responseData.message = e.message;
            DefaultResponse.responseData.payload = null;
            response.set('status', 418);
        }

        return DefaultResponse.responseData;

    }

    async inbox(request: Request, response: Response) {
        try {

            let hUsername = request.header('username');
            const user = await this.userRepository.findByUsername(hUsername);

            var inbox = await this.contactRequestRepository.getInbox(user);
            DefaultResponse.responseData.status = "OK";
            DefaultResponse.responseData.code = "USER-INBOX";
            DefaultResponse.responseData.message = "User inbox data following.";
            DefaultResponse.responseData.payload = inbox;
        } catch (e) {
            console.log(e);
            DefaultResponse.responseData.status = "KO";
            DefaultResponse.responseData.code = e.code;
            DefaultResponse.responseData.message = e.message;
            DefaultResponse.responseData.payload = null;
            response.set('status', 418);
        }
        return DefaultResponse.responseData;
    }


}