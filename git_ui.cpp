#include "crow.h"
#include "git.h"
#include "crow/middlewares/cors.h"

int main()
{
    crow::App<crow::CORSHandler> app; // ✅ Correct

    GitRepo r;
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("*") // or "http://localhost:5173"
        .headers("Content-Type");


    
    CROW_ROUTE(app, "/newcommit")
        .methods(crow::HTTPMethod::POST)
            ([&](const crow::request& req){
                auto data = crow::json::load(req.body);
                Commit *res = r.newCommit(data["name"].s(), data["message"].s());
                
                crow::json::wvalue x;
                x["commitId"] = res->commitID;
                x["content"] = res->content;

                vector<string> parentIds;
                for (Commit* p : res->parents) {
                    parentIds.push_back(p->commitID); 
                }

                x["parents"] = move(parentIds);
                
                return x;
            });
 
    CROW_ROUTE(app, "/graph")([&](){
        crow::json::wvalue x;
        x["commitId"] = r.head()->commitID;
        x["content"] = r.head()->content;
        r.printGraphDOT();

        vector<string> parentIds;
        for (Commit* p : r.head()->parents) {
            parentIds.push_back(p->commitID); 
        }
        

        x["parents"] = std::move(parentIds);
        return x;
    });


    CROW_ROUTE(app, "/checkout")
        .methods(crow::HTTPMethod::POST)
        ([&](const crow::request& req){
            auto data = crow::json::load(req.body);

            string bName = data["branchName"].s();

            r.checkOut(bName);

            crow::json::wvalue x;
            x["branch"] = bName;

            return x;
            
        });

    app.port(8080).multithreaded().run();
}
