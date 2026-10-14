import { projects } from '../../shared/projects.js';

export function onRequest() {
  return Response.json(projects);
}
