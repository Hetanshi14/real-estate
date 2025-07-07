import React, { useState, useEffect, useRef } from 'react';
import { allProperties } from '../data/properties';
import ProgressBar from '../Components/PrograsBar';
import PropertyForm from '../Components/PropertyForm';

const Upcoming = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const upcomingProjects = allProperties.filter(
      (p) => p.status === 'Under Construction'
    );
    setProjects(upcomingProjects);

    const savedId = localStorage.getItem('selected');
    if (savedId) {
      const project = upcomingProjects.find(p => p.id === Number(savedId));
      if (project) {
        setSelectedProject(project);
      }
    }
  }, []);

  const handleRegisterClick = (project) => {
    setSelectedProject(project);
    localStorage.setItem('selected', project.id); 

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleFormClose = () => {
    setSelectedProject(null);
    localStorage.removeItem('selected');
  };

  return (
    <div className="bg-rose-50 min-h-screen px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-700 text-center mb-8">Upcoming Projects</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-stone-700 p-6 shadow rounded">
            <img src={project.image} alt={project.name} className="w-full h-150 object-cover rounded mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">{project.name}</h2>
            <p className="text-white mb-1"><strong>Builder:</strong> {project.builder || 'Zivaas Developers'}</p>
            <p className="text-white mb-1"><strong>Location:</strong> {project.location}</p>
            <p className="text-white mb-1"><strong>Possession Year:</strong> {project.year || '2026'}</p>
            <div className="mb-4">
              <ProgressBar value={project.progress || 60} />
            </div>
            <button
              onClick={() => handleRegisterClick(project)}
              className="bg-white text-stone-700 px-4 py-2 rounded hover:bg-stone-700 hover:text-white border">
              Register Interest
            </button>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div ref={formRef} className="flex justify-center mt-10 mb-20">
          <div className="bg-stone-700 p-6 rounded shadow w-full max-w-2xl">
            <h2 className="text-white text-2xl font-bold mb-4">Register Interest for {selectedProject.name}</h2>
            <PropertyForm property={selectedProject} onClose={handleFormClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Upcoming;
