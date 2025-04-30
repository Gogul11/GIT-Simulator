#ifndef GIT
#define GIT

#include <iostream>
#include <vector>
#include <unordered_map>
#include <fstream>
using namespace std;

struct Commit
{
    string commitID;
    string content;
    vector<Commit *> parents;

    Commit(string c, string mes, vector<Commit *> p) : commitID(c), content(mes), parents(p) {}
};

class GitRepo
{

    unordered_map<string, Commit *> commits;
    unordered_map<string, Commit *> branches;
    string currentBranchHead = "main";
    string currentCommit;

    string generateRandomId(int length) {
        
        const string chars = 
            "0123456789"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "abcdefghijklmnopqrstuvwxyz";
        
        
        srand(static_cast<unsigned int>(time(nullptr)));
        
        string result;
        result.reserve(length);
        
        
        for (int i = 0; i < length; ++i) {
            int randomIndex = rand() % chars.size();
            result += chars[randomIndex];
        }
        
        return result;
    }

public:
    GitRepo()
    {
        branches["main"] = new Commit("init", "Initialized GIT REPO", {});
        commits["init"] = branches["main"];
        currentCommit = "init";
    }

    Commit *head()
    {
        return branches[currentBranchHead];
    }

    Commit *newCommit(string name, string commitMessage)
    {
        Commit *parent = head();
        string cId = generateRandomId(10);
        Commit *nC = new Commit(name, commitMessage, {parent});
        commits[name] = nC;
        branches[currentBranchHead] = nC;
        currentCommit = name;

        return nC;
    }

    void checkOut(const string branchName){
        if(branches.find(branchName) != branches.end()){
            currentBranchHead = branchName;
        }
        else{
            Commit *newHead = head();
            branches[branchName] = newHead;
            currentBranchHead = branchName;
        }
    }

    void printGraphDOT()
    {
        ofstream fout("git.dot");
        fout << "digraph GitGraph {\n";
        fout << "  rankdir=TB;\n";  // Top to bottom
    
        // Commit Nodes
        for (auto &[id, commit] : commits)
        {
            string label = commit->commitID + "\\n" + commit->content;
            bool isHEAD = (commit == branches[currentBranchHead]);
            fout << "  \"" << commit->commitID << "\" [label=\"" << label << "\""
                 << ", shape=ellipse, fontsize=12"
                 << (isHEAD ? ", style=filled, fillcolor=lightblue" : "")
                 << "];\n";
        }
    
        // Parent Links (commit history)
        for (auto &[id, commit] : commits)
        {
            for (Commit* parent : commit->parents)
            {
                fout << "  \"" << commit->commitID << "\" -> \"" << parent->commitID
                     << "\" [dir=back];\n"; // Reverse arrow for git-style flow
            }
        }
    
        // Branch pointers
        for (auto& [branchName, commit] : branches)
        {
            string labelNode = "branch_" + branchName;
            fout << "  \"" << labelNode << "\" [label=\"" << branchName
                 << (branchName == currentBranchHead ? " (HEAD)" : "")
                 << "\", shape=note, fontsize=10, color=green];\n";
            fout << "  \"" << labelNode << "\" -> \"" << commit->commitID
                 << "\" [style=dashed];\n";
        }
    
        fout << "}\n";
    }
    


    // void checkout()
};

#endif