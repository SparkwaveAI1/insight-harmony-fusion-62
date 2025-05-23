
-- Function to append an element to an array column
CREATE OR REPLACE FUNCTION public.array_append_element(
  table_name text,
  column_name text,
  row_id uuid,
  new_element uuid
) RETURNS void 
LANGUAGE plpgsql
AS $$
DECLARE
  query text;
BEGIN
  query := format('UPDATE public.%I SET %I = array_append(%I, $1) WHERE id = $2', 
                  table_name, column_name, column_name);
  EXECUTE query USING new_element, row_id;
END;
$$;

-- Function to remove an element from an array column
CREATE OR REPLACE FUNCTION public.array_remove_element(
  table_name text,
  column_name text,
  row_id uuid,
  element_to_remove uuid
) RETURNS void 
LANGUAGE plpgsql
AS $$
DECLARE
  query text;
BEGIN
  query := format('UPDATE public.%I SET %I = array_remove(%I, $1) WHERE id = $2', 
                  table_name, column_name, column_name);
  EXECUTE query USING element_to_remove, row_id;
END;
$$;
