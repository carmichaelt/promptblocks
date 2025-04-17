# PromptBlocks

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)

**Submission for the 2024 Next.JS Global Hackathon Challenge**

## Overview

PromptBlocks is a web application built with Next.js 15 designed to help users craft more effective prompts for Large Language Models (LLMs). By leveraging AI and incorporating best practices inspired by Google's prompting guidelines, PromptBlocks aims to enhance the quality and precision of generated outputs.

Reference: [Gemini for Google Workspace Prompting Guide 101](https://services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf)

## ✨ Features

*   **AI-Powered Prompt Assistance:** Intelligent suggestions and refinements for your prompts.
*   **Best Practice Integration:** Incorporates established guidelines for effective prompting.
*   **User-Friendly Interface:** Intuitive design for easy prompt creation and management.
*   **Next.js 15:** Built with the latest features of the Next.js framework.

## 💻 Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/)
*   **Language:** TypeScript
*   **UI:** Tailwind CSS, Shadcn, 21st.dev, (some generated using v0.dev)
*   **AI Integration:** Using Vercel AI SDK with xAI provider (other providers can be used)
*   **Deployment:** Hosted on Vercel Hobby Teir

## 🚀 Getting Started

### Prerequisites

*   Node.js (Version >= 18.x)
*   npm, yarn, or pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/carmichaelt/promptblocks.git
    cd promptblocks
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add any necessary API keys or configuration settings.
    ```env
    # Example:
    # XAI_API_KEY="<your_api_key_here>"
    # OPENAI_API_KEY="<your_api_key_here>"
    ```

### Running Locally

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
