import React, { useEffect, useRef, useState } from 'react';
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre'
import axios from 'axios'
import './styles.css';

const GitRepository = () => {
  const gitref = useRef(null);
  
  const [gitInstance, setGitInstance] = useState(null);
  const [newCommitResponse, setNewCommitResponse] = useState({});
  const [prevCommit, setPrevCommit] = useState('init');
  
  const [branchName1, setBranchName1] = useState('');
  const [branchName2, setBranchName2] = useState('');
  const [mergeBranch, setMergeBranch] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  useEffect(() => {
    cytoscape.use(dagre);
    const cy = cytoscape({
      container: gitref.current,
      elements: [
        {data: {id: 'init', message: 'Initialized Git Repo'}},
      ],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0074D9",
            label: "data(id)",
          },
        },
        {
          selector: "edge",
          style: {
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: 'dagre',
        directed: 'true',
        padding: 10
      }
    })

    setGitInstance(cy);

    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.data('message'); 
      alert(`Node clicked: ${nodeId}`); 
    });

    return () => cy.destroy()
  }, [])
  
  const handleNewBranch = async () => {
    // Implementation for creating a new branch
    console.log(`Creating new branch: ${branchName1}`);
    console.log(`Merging branch: ${branchName2}`);
    // API call would go here
  };
  
  const handlePrint = () => {
    console.log('Printing repository visualization');
    window.print();
  };
  
  const handleGetHistory = () => {
    console.log('Getting repository history');
    setShowHistory(true);
  };
  
  const handleMerge = async () => {
    // Implementation for merging branches
    console.log(`Merging branch: ${mergeBranch}`);
    // API call would go here
  };
  
  const handleNewCommit = async() => {
    // await axios.post("http://localhost:8080/newcommit", {
    //         "name" : commitName,
    //         "message" : commitMessage
    // })
    // .then((res) => {
    //     if(!res) return;
    //     setPrevCommit(newCommitResponse.commitId || prevCommit)
    //     setNewCommitResponse(res.data);
    // })
  }
  
  useEffect(() => {
    // if (gitInstance && newCommitResponse.commitId) {
    //     const elements = [];

    //     elements.push({
    //         data: {
    //             id: newCommitResponse.commitId,
    //             label: newCommitResponse.content
    //         }
    //     });

    //     if (newCommitResponse.parents) {
    //         newCommitResponse.parents.forEach(parentId => {
    //             elements.push({
    //                 data: {
    //                     source: parentId,
    //                     target: newCommitResponse.commitId
    //                 }
    //             });
    //         });
    //     }

    //     gitInstance.add(elements);
    //     gitInstance.layout({ name: 'dagre' }).run();
    // }
  }, [newCommitResponse]);
      
  return (
    <div className="git-container">
      {/* Left sidebar - Controls */}
      <div className="git-sidebar">
        <div className="git-title">GIT BRANCH VISUALIZATION</div>
        
        <div className="button-row">
          <input 
            type="text" 
            className="git-input"
            placeholder="Enter branch name" 
            value={branchName1} 
            onChange={(e) => setBranchName1(e.target.value)}
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
          <textarea 
            className="git-textarea"
            placeholder="Enter commit message" 
            value={commitMessage} 
            onChange={(e) => setCommitMessage(e.target.value)}
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
            
            <div className="commit-details-subtitle">Before Merge</div>
            <div className="commit-details-content">
              {/* Placeholder for before merge details */}
              <p>No commit selected. Click on a commit node in the visualization to view details.</p>
            </div>
            
            <div className="commit-details-subtitle">After Merge</div>
            <div className="commit-details-content">
              {/* Placeholder for after merge details */}
              <p>No merge operation performed yet.</p>
            </div>
          </>
        ) : (
          <>
            <div className="commit-details-title">LOG HISTORY</div>
            <div className="commit-details-content log-history">
              {/* Placeholder for repository history */}
            </div>
            <div className="history-actions">
              <button 
                className="git-button back-button"
                onClick={() => setShowHistory(false)}
              >
                Back to Commit Details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GitRepository;