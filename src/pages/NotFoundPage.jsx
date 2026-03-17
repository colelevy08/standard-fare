import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import FlamingoIcon from "../components/ui/FlamingoIcon";

const NotFoundPage = () => (
  <PageLayout>
    <div className="bg-navy min-h-screen flex flex-col items-center justify-center text-center px-6">
      <FlamingoIcon size={80} />
      <h1 className="font-display text-cream text-6xl md:text-8xl mt-6">404</h1>
      <p className="font-body text-cream opacity-60 text-lg mt-4 max-w-md">
        This page wandered off. Let's get you back to the table.
      </p>
      <Link to="/" className="btn-primary mt-8 px-8 py-3">
        Back to Home
      </Link>
    </div>
  </PageLayout>
);

export default NotFoundPage;
