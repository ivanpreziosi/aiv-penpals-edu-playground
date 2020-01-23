import { EntityRepository, Repository, getRepository, Not, In, MoreThanOrEqual } from "typeorm";
import { ContactRequest } from "../entity/ContactRequest";
import { User } from "../entity/User";

var AppConfig = require('../app_config');
var DateHelper = require('../helper/PenpalsDateUtils');

@EntityRepository(ContactRequest)
export class ContactRequestRepository extends Repository<ContactRequest> {

    getRespondedRequests(user: User) {
        return this.createQueryBuilder('request')
            .select("request.id")
            .innerJoin(
                'request.usersResponded',
                'user',
                '(user.username = :username)',
                { username: user.username }
            ).where("(request.isActive = '1' AND request.requestCreateTime >= '" + DateHelper.getRequestExpirationDate().toString() + "')").getMany();
    }

    async getUnrespondedRequests(user: User) {
        var deliveredRequests = await this.getRespondedRequests(user);

        var deliveredRequestsIds = new Array();
        deliveredRequests.forEach(req => {
            deliveredRequestsIds.push(req.id);
        });

        var queryBuilderParams = null;
        if (deliveredRequestsIds.length > 0) {
            queryBuilderParams = {
                id: Not(In(deliveredRequestsIds)),
                isActive: 1,
                requestCreateTime: MoreThanOrEqual(DateHelper.getRequestExpirationDate().toString())
            };
        } else {
            queryBuilderParams = {
                isActive: 1,
                requestCreateTime: MoreThanOrEqual(DateHelper.getRequestExpirationDate().toString())
            };
        }
        
        return this.find({
            relations:["user"],
            where: queryBuilderParams
        });
    }    

    async getInbox(user:User){
        return this.find({
            relations:["user","contactResponses"],
            where: {
                user: user,
                isActive: 1
            },
            order: {
                requestCreateTime: "DESC"
            }
        });
    }

}