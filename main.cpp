#include<iostream>
#include "git.h"

int main(){

    GitRepo repo;

    repo.newCommit("002", "Added README");
    repo.newCommit("003", "Added main.cpp");
    repo.newCommit("004", "Added m.cpp");

    // repo.createBranch("feature");
    // repo.checkout("feature");
    // repo.newCommit("004", "feature start");
    // repo.newCommit("005", "feature done");

    // repo.checkout("main");
    // repo.mergeCommit("006", "Merge feature into main", "feature");

    repo.printGraphDOT();
    return 0;
}