import React, { useEffect, useRef, useState } from 'react';
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre'
import axios from 'axios'

const Git = () => {
    const gitref = useRef(null);

    const[gitInstance, setGitInstane] = useState(null);

    const[newCommitResponse, setNewCommitResponse] = useState({});
    const[prevCommit, setPrevCommit] = useState('init');

    const[commitName, setCommitName] = useState('');
    const[commitMessage, setCommitMessage] = useState('');

    useEffect(() => {

        // cytoscape.use(dagre);
        // const cy = cytoscape({
        //     container : gitref.current,
        //     elements : [
        //         {data : {id : 'init', message : 'Initialized Git Repo'}},
        //     ],
        //     style : [
        //         {
        //             selector: "node",
        //             style: {
        //               "background-color": "#0074D9",
        //               label: "data(id)",
        //             },
        //         },
        //         {
        //             selector: "edge",
        //             style: {
        //                 "line-color": "#ccc",
        //                 "target-arrow-color": "#ccc",
        //                 "target-arrow-shape": "triangle",
        //                 "curve-style": "bezier",
        //             },
        //         },
        //     ],
        //     layout : {
        //         name : 'dagre',
        //         directed : 'true',
        //         padding : 10
        //     }
        // })

        // setGitInstane(cy);

        // cy.on('tap', 'node', (event) => {
        //     const nodeId = event.target.data('message'); 
        //     alert(`Node clicked: ${nodeId}`); 
        // });

        // return () => cy.destroy()
    }, [])

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
        <>
            <label htmlFor="name">Enter Commit Name : </label>
            <input type="text" id='name' value={commitName} onChange={(e) => setCommitName(e.target.value)}  />

            <label htmlFor="message">Enter Commit Message : </label>
            <input type="text" id='message'  value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} />

            <button
                onClick={() => handleNewCommit()}
            >New commit</button>
            <div ref={gitref} style={{ width: '1000px', height: '1000px', border: '1px solid #ccc' }} />
        </>
    );
}

export default Git;
