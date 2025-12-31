import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function ProjectDetails(){
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(()=>{
    let mounted=true;
    const load = async ()=>{
      try{
        const res = await api.get(`/projects/${projectId}`);
        if(!mounted) return;
        setProject(res?.data?.data || res?.data);
      }catch(err){
        console.error(err);
      }
    };
    load();
    return ()=> mounted=false;
  },[projectId]);

  if(!project) return <div>Loading...</div>;

  return (
    <div style={{fontFamily:'sans-serif'}}>
      <h2>{project.name || project.title}</h2>
      <p>{project.description}</p>

      <h3>Tasks</h3>
      {project.tasks && project.tasks.length>0 ? (
        <ul>
          {project.tasks.map(t=>(
            <li key={t.id}>
              <strong>{t.title}</strong> — {t.status}
            </li>
          ))}
        </ul>
      ) : <div>No tasks shown by API</div>}

      <p><Link to="/projects">← Back to projects</Link></p>
    </div>
  );
}
