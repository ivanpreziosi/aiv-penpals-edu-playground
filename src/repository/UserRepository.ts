import { EntityRepository, Repository, getRepository, Not, In, MoreThanOrEqual, getCustomRepository } from "typeorm";
import { ContactRequest } from "../entity/ContactRequest";
import  {ContactRequestRepository} from  "../repository/ContactRequestRepository";
import { User } from "../entity/User";
import { ContactResponse } from "../entity/ContactResponse";

import {Request} from "express";
var PenpalsDateUtils = require('../helper/PenpalsDateUtils');

var DateHelper = require('../helper/PenpalsDateUtils');
import {Md5} from "md5-typescript";
var AppConfig = require('../app_config');

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    //SETS A NEW A TOKEN
	SetToken(request: Request, User: User){
		let userTimestamp = PenpalsDateUtils.getMysqlDateNow();
		User.sessionToken = this.CreateToken(request, User);
        User.sessionCreateTime = userTimestamp;
	}
	
	//VALIDATES TOKEN
	ValidateToken(request: Request, User: User){
		var controlToken = this.CreateControlToken(request, User);
		if(controlToken !== User.sessionToken){
			return false;
		};
		return true;		
	}
	
	//CreateToken
	CreateToken(request: Request, User: User){
		return  Md5.init(User.username+User.password+PenpalsDateUtils.getUnixTimestampNow()+AppConfig.appTokenSalt);
	}

	CreateControlToken(request: Request, User: User){
		console.log("creating ControlToken");
		console.log("username: "+User.username);
		console.log("session_token: "+User.sessionToken);
		console.log("control token: "+Md5.init(User.username+User.sessionToken));
		return Md5.init(User.username+User.sessionToken);
	}    


    findByUsername(usernameToSearch: string) {
        return this.findOne({ username: usernameToSearch });
    }

    deleteAuthToken(user: User) {
        user.sessionToken = null;
        user.sessionCreateTime = null;
        return this.save(user);
    }

    findByHeaderAuth(usernameToSearch: string, tokenToSearch: string) {
        return this.findOne({ username: usernameToSearch, sessionToken: tokenToSearch });
    }

    checkTokenExpiration(user: User) {
        var moment = require('moment');
        var tokenDate = moment(user.sessionCreateTime).format(AppConfig.dbDateFormat);
        var expirationdate = DateHelper.getTokenExpirationDate();

        if (tokenDate < expirationdate) {
            console.log("token expired!");
            return false;
        } else {
            console.log("token still valid!");
            user.sessionCreateTime = DateHelper.getMysqlDateNow();
            this.save(user);
            return true;
        }
    }

    


}