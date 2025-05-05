#include "crow.h"
#include "git.h"
#include "crow/middlewares/cors.h"
#include <thread>
#include <chrono>


//Used for creating multiple instances of the Repo for each user
unordered_map<string, GitRepo> repos;

int main()
{
    //Initializing crow app
    crow::App<crow::CORSHandler> app; 
    
    //CORS - handling
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("https://git-simulator-eight.vercel.app") 
        .methods(crow::HTTPMethod::GET, crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
        .headers("Content-Type", "Authorization", "X-Session-ID") 
        .allow_credentials();
            
    //Route for handling newcommit
    CROW_ROUTE(app, "/newcommit")
        .methods(crow::HTTPMethod::POST)
            ([&](const crow::request& req){
                
                //Gets the session Id
                std::string sessionId = req.get_header_value("X-Session-ID");
                if(repos.find(sessionId) == repos.end()){
                    repos[sessionId] = GitRepo();
                }

                auto &r = repos[sessionId];
                auto data = crow::json::load(req.body);
                Commit *res = r.newCommit(data["message"].s(), data["content"].s());
                
                crow::json::wvalue x;
                x["commitId"] = res->commitID;
                x["message"] = res->message;

                vector<string> parentIds;
                for (Commit* p : res->parents) {
                    parentIds.push_back(p->commitID); 
                }

                x["parents"] = move(parentIds);
                x["contentBefore"] = res->change.before;
                x["contentAfter"]  = res->change.after;
                x["insertion"] = res->change.diff.insertions;;
                x["deletion"] = res->change.diff.deletions;
                x["edits"] = res->change.diff.edits;
                
                return x;
            });
 
    //Route for printing git graph
    // CROW_ROUTE(app, "/Printgit")([&](){
      
    //     // r.printGraphDOT();
    //     for(auto r : repos){
    //         cout<<r.first<<endl;
    //     }
    //     return crow::response(200);
    // });

    //Route for handling checkout
    CROW_ROUTE(app, "/checkout")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req){
            std::string sessionId = req.get_header_value("X-Session-ID");
            if(repos.find(sessionId) == repos.end()){
                repos[sessionId] = GitRepo();
            }
            auto &r = repos[sessionId];
            auto data = crow::json::load(req.body);

            string bName = data["branchName"].s();

            Commit*n = r.checkOut(bName);
            
            crow::json::wvalue x;
            x["commitId"] = n->commitID;
            x["message"] = n->message;

            vector<string> parentIds;
            for (Commit* p : n->parents) {
                parentIds.push_back(p->commitID); 
            }

            x["parents"] = move(parentIds);
            
            return x;
            x["branch"] = bName;

            return x;
            
        });
    
    //Route for handling merge
    CROW_ROUTE(app, "/merge")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req){
            std::string sessionId = req.get_header_value("X-Session-ID");
            if(repos.find(sessionId) == repos.end()){
                repos[sessionId] = GitRepo();
            }


            auto &r = repos[sessionId];
            auto data = crow::json::load(req.body);

            r.merge(data["branchName1"].s(), data["branchName2"].s());

            crow::json::wvalue x;
            x["commitId"] = r.head()->commitID;
            x["message"] = r.head()->message;

            vector<string> parentIds;
            for (Commit* p : r.head()->parents) {
                parentIds.push_back(p->commitID); 
            }
            

            x["parents"] = std::move(parentIds);
            return x;          
        });

        //Route for handling git history
        CROW_ROUTE(app, "/log")
        ([&](const crow::request& req){
            std::string sessionId = req.get_header_value("X-Session-ID");
            if(repos.find(sessionId) == repos.end()){
                repos[sessionId] = GitRepo();
            }

            auto &r = repos[sessionId];
            std::vector<Commit *> ans = r.getLogHistory();
        
            crow::json::wvalue x;
            x["log"] = crow::json::wvalue::list(); 
        
            size_t index = 0;
            for (Commit* c : ans) {
                crow::json::wvalue entry;
                entry["commitID"] = c->commitID;
                entry["message"] = c->message;
                x["log"][index] = std::move(entry); 
                index++;
            }
        
            return x;
        });
        
        //Route for clearing the Session
        CROW_ROUTE(app, "/clear")
            .methods(crow::HTTPMethod::POST)
            ([&](const crow::request& req){
            std::string sessionId = req.get_header_value("X-Session-ID");
        
            if (sessionId.empty()) {
                return crow::response(200, "Missing session ID");
            }
        
            repos.erase(sessionId);
            std::cout << "Cleared session: " << sessionId << std::endl;
        
            return crow::response(200, "Session cleared");
        });
        

    app.port(8080).multithreaded().run();
}
