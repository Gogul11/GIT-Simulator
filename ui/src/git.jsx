import React, { useEffect, useRef, useState } from 'react';
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre'
import klay from 'cytoscape-klay';
import axios from 'axios'
import './styles.css';
import frontendUrl from './url';

const GitRepository = () => {
    const gitref = useRef(null);
    
    const [gitInstance, setGitInstance] = useState(null);
    const [newCommitResponse, setNewCommitResponse] = useState({});
    const [prevCommit, setPrevCommit] = useState('init');
    const [content, setContent] = useState('')
    const [branchName, setBranchName] = useState('');
    const [branchName1, setBranchName1] = useState('');
    const [branchName2, setBranchName2] = useState('');
    const [commitMessage, setCommitMessage] = useState('');
    const [showHistory, setShowHistory] = useState(true);
    const[commits, setCommits] = useState({before : '', after : '', insertions : 0, deletions : 0, edits : 0, message : ''});
    const [log, setLog] = useState([])
    const [sessionId, setSessionId] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const generateSessionId = () => {
      return 'user-' + Math.random().toString(36).substr(2, 9);
    };

    
    useEffect(() => {
      setSessionId(() =>generateSessionId());
    }, [])

    useEffect(() => {
      if (!sessionId) return;
    
      const handleBeforeUnload = () => {
        fetch(`${frontendUrl}/clear`, {
          method: "POST",
          headers: {
            "X-Session-ID": sessionId
          },
          keepalive: true
        });
      };
    
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, [sessionId]);
    
    
    useEffect(() => {
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

      await axios.post(`${frontendUrl}/checkout`, {
          "branchName" : branchName
      }, {
        headers : {
          "X-Session-ID" : sessionId
        }
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

          gitInstance.add(elements);
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
        await axios.get(`${frontendUrl}/log`, {
          headers : {
            "X-Session-ID" : sessionId
          }
        })
        .then((res) => {
            setLog(res.data.log)
            setShowHistory(true)
        })
    };
    
    const handleMerge = async () => {
      await axios.post(`${frontendUrl}/merge`, {
        "branchName1" : branchName1,
        "branchName2" : branchName2
      }, {
        headers : {
          "X-Session-ID" : sessionId
        }
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

          gitInstance.add(elements);
          gitInstance.$id(res.data.commitId).style({
            "background-color": "green"
          });
          
          gitInstance.layout({ name: 'klay' }).run();
      })
      };
      
    const handleNewCommit = async() => {
      await axios.post(`${frontendUrl}/newcommit`, {
              "message" : commitMessage,
              "content" : content
      }, {
        headers : {
          "X-Session-ID" : sessionId
        }
      })
      .then((res) => {
          if(!res) return;
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
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>
        <div  className={`git-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="git-title" style={{marginTop : '50px'}}>GIT BRANCH VISUALIZATION</div>
          
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
            {/* <button 
              className="git-button print-button"
              onClick={handlePrint}
            >
              Print Repository
            </button> */}
          </div>

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
        <div className="git-visualization">
          <div ref={gitref} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    );
};

export default GitRepository;