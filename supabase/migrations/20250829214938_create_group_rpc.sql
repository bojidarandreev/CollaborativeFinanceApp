create or replace function create_group_and_add_owner(group_name text, owner_id uuid)
returns void as $$
declare
  new_group_id uuid;
begin
  -- Insert the new group and get its ID
  insert into public.groups (name, owner_id)
  values (group_name, owner_id)
  returning id into new_group_id;

  -- Insert the owner into the group_members table
  insert into public.group_members (group_id, user_id, role)
  values (new_group_id, owner_id, 'owner');
end;
$$ language plpgsql security definer;
