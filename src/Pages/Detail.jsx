import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { allProperties } from '../data/properties';
import { agents } from '../data/agents';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [interest, setInterest] = useState('');
  const [tenure, setTenure] = useState('');
  const [emi, setEmi] = useState(null);

  useEffect(() => {
    const localProperties = JSON.parse(localStorage.getItem('zivaas_properties')) || [];
    const combinedProperties = [...allProperties, ...localProperties];
    const foundProperty = combinedProperties.find(p => p.id === parseInt(id));
    setProperty(foundProperty);

    const localAgents = JSON.parse(localStorage.getItem('zivaas_agents')) || [];
    const combinedAgents = [...agents, ...localAgents];

    if (foundProperty && foundProperty.agentId) {
      const matchedAgent = combinedAgents.find(a => a.id === foundProperty.agentId);
      setAgent(matchedAgent);
    }
  }, [id]);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interest) / 12 / 100;
    const months = parseInt(tenure);

    if (principal && rate && months) {
      const emiCalc = (principal * rate * Math.pow(1 + rate, months)) /
                      (Math.pow(1 + rate, months) - 1);
      setEmi(emiCalc.toFixed(2));
    } else {
      setEmi(null);
    }
  };

  if (!property) return <div className="p-6">Loading property...</div>;

  return (
    <div className="bg-rose-50 min-h-screen flex flex-col gap-5 px-6 py-10">
      <div className="grid md:grid-cols-2 gap-8 min-w-8xl mx-auto">
        <div className="w-full h-150 overflow-hidden rounded shadow">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"/>
        </div>

        <div className="bg-stone-700 shadow p-6 rounded space-y-4">
          <h1 className="text-3xl font-bold text-stone-700">{property.name}</h1>
          <p className="text-white"><strong>Builder:</strong> {property.builder}</p>
          <p className="text-white"><strong>Location:</strong> {property.location}</p>
          <p className="text-white"><strong>Price:</strong> ₹{(property.price).toLocaleString()}</p>
          <p className="text-white"><strong>BHK:</strong> {property.bhk} BHK</p>
          <p className="text-white"><strong>Type:</strong> {property.type}</p>
          <p className="text-white"><strong>Status:</strong> {property.status}</p>
          <p className="text-white"><strong>Possession Year:</strong> {property.year}</p>

          {property.amenities?.length > 0 && (
            <div>
              <strong className="text-white">Amenities:</strong>
              <ul className="list-disc list-inside text-white">
                {property.amenities.map((item, index) => (
                <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => navigate('/booking')}
            className="bg-white text-stone-700 px-6 py-3 rounded hover:bg-stone-700 hover:text-white border">
            Book a Visit
          </button>
        </div>
      </div>

        <div className="bg-stone-700 p-1 rounded shadow">
          <h3 className="text-xl font-bold mb-2 flex justify-center text-white">Location on Map</h3>
            <iframe
              title="Google Map"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${property.location}&output=embed`}/>
        </div>

        <div className="bg-stone-700 p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4 text-white">EMI Calculator</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input
                type="number"
                placeholder="Loan Amount (₹)"
                className="border-1 text-white border-white px-3 py-2 rounded"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}/>
              <input
                type="number"
                placeholder="Interest Rate (%)"
                className="border-1 text-white border-white px-3 py-2 rounded"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}/>
              <input
                type="number"
                placeholder="Tenure (months)"
                className="border-1 text-white border-white px-3 py-2 rounded"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}/>
            </div>
            <button
              onClick={calculateEMI}
              className="bg-white text-stone-700 px-4 py-2 rounded hover:text-white hover:bg-stone-700 border">
              Calculate EMI
            </button>
            {emi && (
              <p className="mt-4 text-stone-700 font-semibold">
                Monthly EMI: ₹{emi}
              </p>
          )}
        </div>

      {agent && (
        <div className="max-w-7xl mx-auto mt-10 bg-stone-700 shadow p-6 rounded">
          <h3 className="text-xl font-bold text-white mb-4">Agent Information</h3>
          <div className="flex items-center gap-4">
            <img
              src={agent.photo}
              alt={agent.name}
              className="w-20 h-20 object-cover rounded-full border"/>
            <div>
              <p className="text-white font-semibold">{agent.name}</p>
              <p className="text-white">📞 {agent.contact}</p>
              <p className="text-white">⭐ {agent.rating} • {agent.experience}</p>
              <Link to="/agents" className="text-rose-100 hover:underline mt-2 inline-block">
                View All Agents
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
