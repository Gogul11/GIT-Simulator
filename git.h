#ifndef GIT
#define GIT

#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <fstream>
#include <stack>
using namespace std;



vector<string> splitLines(const string& str) {
    vector<string> lines;
    istringstream stream(str);
    string line;
    while (getline(stream, line)) {
        lines.push_back(line);
    }
    return lines;
}

int levenshteinDistance(const string& s1, const string& s2) {
    const size_t len1 = s1.size(), len2 = s2.size();
    vector<vector<int>> d(len1 + 1, vector<int>(len2 + 1));

    for (size_t i = 0; i <= len1; ++i) d[i][0] = i;
    for (size_t j = 0; j <= len2; ++j) d[0][j] = j;

    for (size_t i = 1; i <= len1; ++i) {
        for (size_t j = 1; j <= len2; ++j) {
            int cost = (s1[i-1] == s2[j-1]) ? 0 : 1;
            d[i][j] = min({d[i-1][j] + 1,     // deletion
                           d[i][j-1] + 1,      // insertion
                           d[i-1][j-1] + cost});// substitution
        }
    }
    return d[len1][len2];
}


struct DiffStats {
    int insertions = 0;
    int deletions = 0;
    int edits = 0;
    
    void print() const {
        cout << "+" << insertions << " -" << deletions << " ~" << edits << endl;
    }
};

struct ContentChange {
    string before;
    string after;
    DiffStats diff;
    
    void calculateDiff() {
        diff = DiffStats(); 
        
        vector<string> beforeLines = splitLines(before);
        vector<string> afterLines = splitLines(after);
        
       
        size_t maxLines = max(beforeLines.size(), afterLines.size());
        for (size_t i = 0; i < maxLines; ++i) {
            if (i >= beforeLines.size()) {
                diff.insertions++;
            } 
            else if (i >= afterLines.size()) {
                diff.deletions++;
            }
            else if (beforeLines[i] != afterLines[i]) {
                
                int charChanges = levenshteinDistance(beforeLines[i], afterLines[i]);
                if (charChanges > 0) {
                    diff.edits++;
                }
            }
        }
    }
};

struct Commit
{
    string commitID;
    string message;
    vector<Commit *> parents;
    ContentChange change;

    Commit(string c, string mes, vector<Commit *> p, ContentChange cc = {}) 
        : commitID(c), message(mes), parents(p), change(cc)  {
            change.calculateDiff();
        }
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
        ContentChange initialChange{"", ""};
        branches["main"] = new Commit("init", "Initialized GIT REPO", {}, initialChange);
        commits["init"] = branches["main"];
        currentCommit = "init";
    }

    Commit *head()
    {
        return branches[currentBranchHead];
    }

    Commit *newCommit(const string commitMessage, const string content)
    {
        ContentChange newChange{
            head()->change.after,
            content
        };
        Commit *parent = head();
        string cId = generateRandomId(10);
        Commit *nC = new Commit(cId, commitMessage, {parent}, newChange);
        while(commits.find(cId) != commits.end()){
            cId = generateRandomId(10);
        }
        commits[cId] = nC;
        branches[currentBranchHead] = nC;
        currentCommit = cId;

        return nC;
    }

    Commit *checkOut(const string& branchName) {
        Commit* parent = head();  
    

        string cId = generateRandomId(10);
        string message = "Checkout to branch: " + branchName;
        Commit* newCommit = new Commit(cId, message, {parent});
        
        commits[newCommit->commitID] = newCommit;
    
        branches[branchName] = newCommit;
        currentBranchHead = branchName;

        return newCommit;
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

    vector<Commit *> getLogHistory(){

        unordered_set<string> visited;
        stack<Commit*> st;
        vector<Commit*> log;
        Commit *commit = head();
    
        st.push(commit);
    
        while (!st.empty()) {
            Commit* curr = st.top();
            st.pop();
            log.push_back(curr);
            if (visited.count(curr->commitID)) continue;
            visited.insert(curr->commitID);
    
            cout << curr->commitID << ": " << curr->message << endl;
    
            for (Commit* parent : curr->parents) {
                if (!visited.count(parent->commitID)) {
                    st.push(parent);
                }
            }
        }

        return log;
    }

};

#endif