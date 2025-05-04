#include "crow.h"
#include "git.h"
#include "crow/middlewares/cors.h"

int main()
{
    crow::App<crow::CORSHandler> app; // ✅ Correct

    GitRepo r;
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("*")
        .headers("Content-Type");


    
    CROW_ROUTE(app, "/newcommit")
        .methods(crow::HTTPMethod::POST)
            ([&](const crow::request& req){
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
 
    CROW_ROUTE(app, "/Printgit")([&](){
      
        r.printGraphDOT();
        return crow::response(200);
    });


    CROW_ROUTE(app, "/checkout")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req){
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

    CROW_ROUTE(app, "/merge")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req){
            auto data = crow::json::load(req.body);

            r.merge(data["branchName1"].s(), data["branchName2"].s());

            crow::json::wvalue x;
            x["commitId"] = r.head()->commitID;
            CROW_ROUTE(app, "/log")
            ([&](){
                vector<Commit *> ans = r.getLogHistory();
    
                crow::json::wvalue x;
                x["log"] = std::move(ans);
    
                return x;
            });   x["message"] = r.head()->message;

            vector<string> parentIds;
            for (Commit* p : r.head()->parents) {
                parentIds.push_back(p->commitID); 
            }
            

            x["parents"] = std::move(parentIds);
            return x;          
        });

        CROW_ROUTE(app, "/log")
        ([&](){
            std::vector<Commit *> ans = r.getLogHistory();
        
            crow::json::wvalue x;
            x["log"] = crow::json::wvalue::list(); // Initialize as empty list
        
            size_t index = 0;
            for (Commit* c : ans) {
                crow::json::wvalue entry;
                entry["commitID"] = c->commitID;
                entry["message"] = c->message;
                x["log"][index] = std::move(entry); // Assign by index
                index++;
            }
        
            return x;
        });

    app.port(8080).multithreaded().run();
}
