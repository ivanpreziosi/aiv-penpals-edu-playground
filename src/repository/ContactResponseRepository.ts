import { EntityRepository, Repository, getRepository, Not, In, MoreThanOrEqual } from "typeorm";
import { ContactRequest } from "../entity/ContactRequest";
import { ContactResponse } from "../entity/ContactResponse";
import { User } from "../entity/User";

var AppConfig = require('../app_config');
var DateHelper = require('../helper/PenpalsDateUtils');

@EntityRepository(ContactResponse)
export class ContactResponseRepository extends Repository<ContactResponse> {
    getUndeliveredResponses(user: User) {
        return this.find({
            select: ["id"],
            where: {
                user: user,
                isActive: 1,
                isDelivered: 0,
                resposeCreateTime: DateHelper.getRequestExpirationDate().toString()
            }
        });
    }

    getUnreadResponses(user: User) {
        return this.find({
            relations: ["contactRequest", "user"],
            where: { recipient: user, isActive: 1, isDelivered: 0 }
        });
    }


    

}