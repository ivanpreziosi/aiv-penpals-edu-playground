import { UserController } from "./controller/UserController";
import { ContactRequestController } from "./controller/ContactRequestController";
import { ContactResponseController } from "./controller/ContactResponseController";

var AppConfig = require('./app_config');

export const Routes = [
    {
        method: "get",
        route: "/" + AppConfig.version + "/users",
        controller: UserController,
        action: "profile",
        isPublic: false
    },
    {
        method: "get",
        route: "/" + AppConfig.version + "/inbox",
        controller: UserController,
        action: "inbox",
        isPublic: false
    },
    {
        method: "post",
        route: "/" + AppConfig.version + "/users",
        controller: UserController,
        action: "save",
        isPublic: true
    },
    {
        method: "post",
        route: "/" + AppConfig.version + "/login",
        controller: UserController,
        action: "login",
        isPublic: true
    },

    /** CONTACT REQUESTS **/
    { //save request
        method: "post",
        route: "/" + AppConfig.version + "/reqs",
        controller: ContactRequestController,
        action: "save",
        isPublic: false
    },
    { // get logged user requests
        method: "get",
        route: "/" + AppConfig.version + "/reqs/mine",
        controller: ContactRequestController,
        action: "mine",
        isPublic: false
    },
    { //get all open requests
        method: "get",
        route: "/" + AppConfig.version + "/reqs/all",
        controller: ContactRequestController,
        action: "all",
        isPublic: false
    },
    { // get all open request of user
        method: "get",
        route: "/" + AppConfig.version + "/reqs/all/:userId",
        controller: ContactRequestController,
        action: "user",
        isPublic: false
    },
    { // get a single request
        method: "get",
        route: "/" + AppConfig.version + "/reqs/:reqId",
        controller: ContactRequestController,
        action: "single",
        isPublic: false
    },


    /** CONTACT RESPONSES **/
    { // get A REQUEST responses
        method: "get",
        route: "/" + AppConfig.version + "/resp/:reqId",
        controller: ContactResponseController,
        action: "request",
        isPublic: false
    },
    { //save request
        method: "post",
        route: "/" + AppConfig.version + "/resp",
        controller: ContactResponseController,
        action: "save",
        isPublic: false
    },
    { //deliver request
        method: "post",
        route: "/" + AppConfig.version + "/resp/deliver",
        controller: ContactResponseController,
        action: "deliver",
        isPublic: false
    }

];