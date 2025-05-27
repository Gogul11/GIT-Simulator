# Git Branch Visualization

Git Branch Visualization is a web-based tool that allows users to simulate and visualize Git operations such as committing, branching, and merging. It provides a graphical representation of the commit history and branch structure, making it easier to understand how Git works internally. This project is ideal for beginners learning Git or for demonstrating Git concepts in an educational setting.

## Link

[Here's the link](https://git-simulator-eight.vercel.app/)

## Features

- Create new commits with custom messages and content
- Create and switch between branches
- Merge two branches into a new commit
- Visualize the commit graph dynamically using Cytoscape.js
- View commit history and inspect individual commit details

## Tech Stack

### Frontend

- **React** – For building the interactive UI
- **Cytoscape.js** – For rendering the Git commit DAG (Directed Acyclic Graph)
- **Axios** – For handling API requests to the backend
- **CSS** – For custom styling and layout

### Backend

- **C++ (Crow Framework)** – Lightweight web server for handling API requests
- **Custom Git Logic** – Core Git-like features (commit, branch, merge) implemented from scratch in C++
- **Session Handling** – Each session is isolated with a unique ID to simulate a separate repository instance

## Implementation Overview

### Frontend

- Initializes with a single `init` commit.
- Users can:
  - Create commits by entering a message and file content
  - Create and switch branches
  - Merge branches
- The commit graph is dynamically visualized using Cytoscape.
- Node colors:
  - Blue – Normal commit
  - Orange – Branch head
  - Green – Merge commit
- Clicking a commit node shows:
  - Commit message
  - Diffs (insertions, deletions, edits)

### Backend

- In-memory representation of commits and branches per session
- REST API Endpoints:
  - `POST /newcommit` – Create a new commit
  - `POST /checkout` – Create/switch branches
  - `POST /merge` – Merge branches
  - `GET /log` – Fetch commit history
  - `POST /clear` – Reset session state
- Commits store:
  - Unique IDs
  - Parent references
  - Diff data
  - Messages


## Session Handling

Each user session is uniquely isolated to simulate an independent Git repository instance.

- A **unique session ID** is assigned to every user on page load  
- This session ID is used to maintain **separate in-memory repository states** for each user  
- Ensures that **simultaneous users do not interfere** with each other's commit graphs or operations  
- The backend tracks each session independently, enabling **sandboxed Git simulations**


## Contributions

This project was collaboratively built as part of a team effort.

**Special thanks to my teammates** [Baalaguru](https://github.com/BaalaguruJ) and [Monish Kumar](https://github.com/Monishkumar-14) for their continuous support, valuable ideas, and dedication throughout the development of this project:


