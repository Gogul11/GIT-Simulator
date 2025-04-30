#ifndef GIT
#define GIT

#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <fstream>
#include <stack>
using namespace std;

struct Commit
{
    string commitID;
    string message;
    vector<Commit *> parents;

    Commit(string c, string mes, vector<Commit *> p) : commitID(c), message(mes), parents(p) {}
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

    Commit *newCommit(string commitMessage)
    {
        Commit *parent = head();
        string cId = generateRandomId(10);
        Commit *nC = new Commit(cId, commitMessage, {parent});
        while(commits.find(cId) != commits.end()){
            cId = generateRandomId(10);
        }
        commits[cId] = nC;
        branches[currentBranchHead] = nC;
        currentCommit = cId;

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
        fout << "  rankdir=TB;\n";
    
        for (auto &[id, commit] : commits)
        {
            string label = commit->commitID + "\\n" + commit->message;
            bool isHEAD = (commit == branches[currentBranchHead]);
            fout << "  \"" << commit->commitID << "\" [label=\"" << label << "\""
                 << ", shape=ellipse, fontsize=12"
                 << (isHEAD ? ", style=filled, fillcolor=lightblue" : "")
                 << "];\n";
        }
    
        for (auto &[id, commit] : commits)
        {
            for (Commit* parent : commit->parents)
            {
                fout << "  \"" << commit->commitID << "\" -> \"" << parent->commitID
                     << "\" [dir=back];\n";
            }
        }
    
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
    
    void merge(const string b1, const string b2){
        Commit *p1 = branches[b1];
        Commit *p2 = branches[b2];

        string mergeCommitID = generateRandomId(10); 
        string mergeMessage = "Merge " + b2 + " into " + b1;

        Commit* mergeCommit = new Commit(mergeCommitID, mergeMessage, {p1, p2});
        commits[mergeCommitID] = mergeCommit;
        branches[b1] = mergeCommit;

        currentBranchHead = b1;
        currentCommit = mergeCommitID;

        if(b2 != "main"){
            branches.erase(b2);
        }
    }

    void getLogHistory(Commit *commit){

        unordered_set<string> visited;
        stack<Commit*> st;
    
        if (!commit) return;
    
        st.push(commit);
    
        while (!st.empty()) {
            Commit* curr = st.top();
            st.pop();
    
            if (visited.count(curr->commitID)) continue;
            visited.insert(curr->commitID);
    
            cout << curr->commitID << ": " << curr->message << endl;
    
            for (Commit* parent : curr->parents) {
                if (!visited.count(parent->commitID)) {
                    st.push(parent);
                }
            }
        }
    }

};

#endif