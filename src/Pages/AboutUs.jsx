import React, { useEffect, useState } from 'react';
import { agents as defaultAgents } from '../data/agents';
import { allProperties as defaultProperties } from '../data/properties';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    document.title = 'About Us - Zivaas Properties';

    const storedAgents = JSON.parse(localStorage.getItem('zivaas_agents')) || [];
    setAgents([...defaultAgents, ...storedAgents]);

    const storedProperties = JSON.parse(localStorage.getItem('zivaas_properties')) || [];
    setProperties([...defaultProperties, ...storedProperties]);
  }, []);

  return (
    <div className="bg-rose-50 min-h-screen px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-700 text-center mb-8">Meet Our Team</h1>

      <p className="max-w-3xl mx-auto text-center text-stone-600 mb-12">
        At Zivaas Properties, our dedicated agents bring years of experience and a passion for real estate to help you find the perfect home. Get to know the people who make your dreams a reality.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {agents.map((agent) => {
          const agentProperties = properties.filter(p => p.agentId === agent.id);

          return (
            <div className="bg-stone-700 shadow-md p-4 rounded-lg" key={agent.id}>
              <h2 className="text-xl font-semibold text-white mb-2">{agent.name}</h2>
              <div className="flex items-center gap-6 mb-3">
                <img
                  src={agent.photo}
                  alt={agent.name}
                  className="w-20 h-20 object-cover rounded-full border"
                />
                <div>
                  <p className="text-white"><strong>Contact:</strong> {agent.contact}</p>
                  <p className="text-white"><strong>Experience:</strong> {agent.experience}</p>
                  <p className="text-white"><strong>Rating:</strong> ⭐ {agent.rating}</p>
                </div>
              </div>

              <div>
                <strong className="text-white">Properties:</strong>
                {agentProperties.length > 0 ? (
                  <ul className="list-disc list-inside text-white mt-2">
                    {agentProperties.map((prop) => (
                      <li key={prop.id}>
                        <Link
                          to={`/detail/${prop.id}`}
                          className="text-rose-100 hover:underline"
                        >
                          {prop.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white mt-2">No properties listed yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AboutUs;
