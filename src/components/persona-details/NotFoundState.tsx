
import React from "react";
import { Link } from "react-router-dom";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";

const NotFoundState = () => {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-bold mb-3">Persona Not Found</h3>
      <p className="text-muted-foreground mb-6">
        The persona you're looking for doesn't exist or couldn't be loaded.
      </p>
      <Button as={Link} to="/persona-viewer">View All Personas</Button>
    </Card>
  );
};

export default NotFoundState;
