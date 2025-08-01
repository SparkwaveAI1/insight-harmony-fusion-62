-- Add columns to store image data alongside text for visual analysis
ALTER TABLE knowledge_base_documents 
ADD COLUMN image_url TEXT,
ADD COLUMN image_data TEXT,
ADD COLUMN is_image BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on image documents
CREATE INDEX idx_knowledge_base_documents_is_image ON knowledge_base_documents(is_image) WHERE is_image = true;