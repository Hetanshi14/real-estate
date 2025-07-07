import React, { useState, useEffect, useRef } from 'react';
import { allProperties } from '../data/properties';
import ProgressBar from '../Components/ProgressBar';
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
    <div className="bg-rose-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-700 text-center mb-8">Upcoming Projects</h1>

      <div className="py-10 bg-rose-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center items-center max-w-5xl mx-auto px-4">
          {projects.map((project) => (
            <div key={project.id} className="relative group w-full max-w-md shadow-lg rounded overflow-hidden">
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"/>

              <div className="absolute inset-0 bg-transparent opacity-100 md:backdrop-blur bg-opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 space-y-3">
                <div className="text-white text-left">
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <p className="text-sm">{project.location}</p>
                  <p className="text-sm">Builder: {project.builder || 'Zivaas Developers'}</p>
                  <p className="text-sm">Possession: {project.year || '2026'}</p>
                </div>

                <ProgressBar value={project.progress || 60} />

                <button
                  onClick={() => handleRegisterClick(project)}
                  className="relative inline-block w-fit px-3 py-1 rounded text-sm text-stone-700 bg-white border z-10 overflow-hidden 
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700 
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white">
                  Register Interest
                </button>
              </div>
            </div>
          ))}
        </div>
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
