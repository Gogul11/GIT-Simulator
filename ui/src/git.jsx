import React, { useEffect, useRef, useState } from 'react';
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre'
import klay from 'cytoscape-klay';
import axios from 'axios'
import './styles.css';

// axios.defaults.withCredentials = true;

const GitRepository = () => {
  const gitref = useRef(null);
  
  const [gitInstance, setGitInstance] = useState(null);
  const [newCommitResponse, setNewCommitResponse] = useState({});
  const [prevCommit, setPrevCommit] = useState('init');
  const [content, setContent] = useState('')
  const [branchName, setBranchName] = useState('');
  const [branchName1, setBranchName1] = useState('');
  const [branchName2, setBranchName2] = useState('');
  const [mergeBranch, setMergeBranch] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const[commits, setCommits] = useState({before : '', after : '', insertions : 0, deletions : 0, edits : 0, message : ''});
  const [currentHEAD, setCurrentHEAD] = useState('init');
  const [log, setLog] = useState([])
  
  useEffect(() => {
    // cytoscape.use(dagre);
    cytoscape.use(klay);
    const cy = cytoscape({
      container: gitref.current,
      elements: [
        {data: {id: 'init', 
                commits : {
                  before : '',
                  after : '',
                  insertions : 0,
                  deletions : 0,
                  edits : 0,
                  message: 'Initialized Git Repo',
                }
          }},
        
      ],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0074D9",
            label: "data(id)",
            "height" : 5,
            "width" : 5,
            "font-size": 2,
          },
        },
        {
          selector: "edge",
          style: {
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "width" : 1,
            'arrow-scale': 0.5,
          },
        },
      ],
      layout: {
        name: 'klay',
        nodeDimensionsIncludeLabels: true,
        klay: {
          direction: 'RIGHT', // or 'DOWN'
          spacing: 150,
          edgeSpacingFactor: 1.5,
          inLayerSpacingFactor: 1.2,
          layoutHierarchy: true,
          nodePlacement: 'BRANDES_KOEPF'
        }
      }
    })

    setGitInstance(cy);

    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.data('commits'); 
      setCommits({
        before : nodeId.before,
        after : nodeId.after,
        insertions : nodeId.insertions,
        deletions : nodeId.deletions,
        edits : nodeId.edits,
        message : nodeId.message
      })
      setShowHistory(false)
    });

    return () => cy.destroy()
  }, [])
  
  const handleNewBranch = async () => {
    await axios.post('http://localhost:8080/checkout', {
        "branchName" : branchName
    }).then((res) => {
        if(!res) return;
        const elements = [];

        elements.push({
            data: {
                id: res.data.commitId,
                commits : {
                  before : newCommitResponse.contentBefore,
                  after : newCommitResponse.contentAfter,
                  insertions : newCommitResponse.insertion,
                  deletions : newCommitResponse.deletion,
                  edits : newCommitResponse.edits,
                  message: res.data.message,
                }
            }
        });

        if (res.data.parents) {
            res.data.parents.forEach(parentId => {
                elements.push({
                    data: {
                        source: parentId,
                        target: res.data.commitId
                    }
                });
            });
        }

        const currentPosition = gitInstance.$id(res.data.commitId).position();
        const offset = 50;

        gitInstance.add(elements);
        // gitInstance.$id(res.data.commitId).position({
        //   x : currentPosition.x - offset,
        //   y : currentPosition.y
        // })
        gitInstance.$id(res.data.commitId).style({
          "background-color": "orange"
        });
        
        gitInstance.layout({ name: 'klay' }).run();
    })
  };
  
  const handlePrint = async() => {
    // await axios.get('http://localhost:8080/Printgit')
    // .then((res) => {
    //   if(res) 
    //       window.alert("Printed check folder");
    // })
  };
  
  const handleGetHistory = async() => {   
      await axios.get("http://localhost:8080/log")
      .then((res) => {
          setLog(res.data.log)
          setShowHistory(true)
      })
  };
  
  const handleMerge = async () => {
    await axios.post('http://localhost:8080/merge', {
      "branchName1" : branchName1,
      "branchName2" : branchName2
    }).then((res) => {
        if(!res) return;
        const elements = [];

        elements.push({
            data: {
                id: res.data.commitId,
                commits : {
                  before : newCommitResponse.contentBefore,
                  after : newCommitResponse.contentAfter,
                  insertions : newCommitResponse.insertion,
                  deletions : newCommitResponse.deletion,
                  edits : newCommitResponse.edits,
                  message: res.data.message,
                }
            }
        });

        if (res.data.parents) {
            res.data.parents.forEach(parentId => {
                elements.push({
                    data: {
                        source: parentId,
                        target: res.data.commitId
                    }
                });
            });
        }

        const currentPosition = gitInstance.$id(res.data.commitId).position();
        const offset = 50;

        gitInstance.add(elements);
        // gitInstance.$id(res.data.commitId).position({
        //   x : currentPosition.x - offset,
        //   y : currentPosition.y
        // })
        gitInstance.$id(res.data.commitId).style({
          "background-color": "green"
        });
        
        gitInstance.layout({ name: 'klay' }).run();
    })
    };
    
  const handleNewCommit = async() => {
    await axios.post("http://localhost:8080/newcommit", {
            "message" : commitMessage,
            "content" : content
    },{
      withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
    })
    .then((res) => {
        if(!res) return;
        console.log(res.data)
        setPrevCommit(newCommitResponse.commitId || prevCommit)
        setNewCommitResponse(res.data);
    })
  }
  
  useEffect(() => {
    if (gitInstance && newCommitResponse.commitId) {
        const elements = [];

        elements.push({
            data: {
                id: newCommitResponse.commitId,
                commits : {
                  before : newCommitResponse.contentBefore,
                  after : newCommitResponse.contentAfter,
                  insertions : newCommitResponse.insertion,
                  deletions : newCommitResponse.deletion,
                  edits : newCommitResponse.edits,
                  message: newCommitResponse.message,
                }
            }
        });

        if (newCommitResponse.parents) {
            newCommitResponse.parents.forEach(parentId => {
                elements.push({
                    data: {
                        source: parentId,
                        target: newCommitResponse.commitId
                    }
                });
            });
        }

        gitInstance.add(elements);
        gitInstance.layout({ name: 'klay' }).run();
    }
  }, [newCommitResponse]);
  
      
  return (
    <div className="git-container">
   
      <div className="git-sidebar">
        <div className="git-title">GIT BRANCH VISUALIZATION</div>
        
        <div className="button-row">
          <input 
            type="text" 
            className="git-input"
            placeholder="Enter branch name" 
            value={branchName} 
            onChange={(e) => setBranchName(e.target.value)}
          />
          <button 
            className="git-button branch-button"
            onClick={handleNewBranch}
          >
            Branch
          </button>
        </div>
        
        <div className="button-row">
          <input 
            type="text" 
            className="git-input"
            placeholder="Enter branch 1 to merge" 
            value={branchName1} 
            onChange={(e) => setBranchName1(e.target.value)}
          />
          <input 
            type="text" 
            className="git-input"
            placeholder="Enter branch 2 to merge" 
            value={branchName2} 
            onChange={(e) => setBranchName2(e.target.value)}
          />
          <button 
            className="git-button merge-button"
            onClick={handleMerge}
          >
            Merge
          </button>
        </div>
        
        <div className="button-row">
          <div className="git-label">Commit</div>
          <input 
            type="text" 
            className="git-input"
            placeholder="Enter commit message" 
            value={commitMessage} 
            onChange={(e) => setCommitMessage(e.target.value)}
          />
          <textarea 
            className="git-textarea"
            placeholder="Enter commit message" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button 
            className="git-button commit-button"
            onClick={handleNewCommit}
          >
            Create Commit
          </button>
        </div>
        
        <div className="button-row">
          <button 
            className="git-button history-button"
            onClick={handleGetHistory}
          >
            Get History
          </button>
          <button 
            className="git-button print-button"
            onClick={handlePrint}
          >
            Print Repository
          </button>
        </div>
      </div>
      
      {/* Middle section - Visualization */}
      <div className="git-visualization">
        <div ref={gitref} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Right section - Commit Details or History */}
      <div className="git-commit-details">
        {!showHistory ? (
          <>
            <div className="commit-details-title">COMMIT DETAILS</div>
            <p>Message : {commits.message}</p>            
            <div className="commit-details-subtitle">Before Commit</div>
            <div className="commit-details-content">
              {commits.before}
            </div>
            
            <div className="commit-details-subtitle">After After commit</div>
            <div className="commit-details-content">
              {commits.after}
            </div>

            <div>
              <p>Insertions : {commits.insertions}</p>
              <p>Deletions : {commits.deletions}</p>
              <p>Edits : {commits.edits}</p>
            </div>
          </>
        ) : (
          <>
            <div className="commit-details-title">LOG HISTORY</div>
            <div className="commit-details-content log-history">
                {log.map((item, index) => (
                  <div key={index}>
                    <p>{item.commitID}</p>
                    <p>{item.message}</p>
                    <hr />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GitRepository;