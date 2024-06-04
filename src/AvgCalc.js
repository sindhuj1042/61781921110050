import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:9876/numbers/'; 

function AvgCalc() {
  const [type, setType] = useState('p');
  const [prev, setPrev] = useState([]);
  const [curr, setCurr] = useState([]);
  const [nums, setNums] = useState([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const fetchAvg = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      const response = await axios.get(BASE_URL + type, { timeout: 500 });
      setPrev(response.data.windowPrevState);
      setCurr(response.data.windowCurrState);
      setNums(response.data.numbers);
      setAvg(response.data.avg);
    } catch (error) {
      setErr(`Failed to fetch data. ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchAvg();
  }, [fetchAvg]); 

  const renderTable = () => {
    if (prev.length === 0) {
      return null; 
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Prev</th>
            <th>Curr</th>
            <th>Nums</th>
            <th>Avg</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{prev.join(', ')}</td>
            <td>{curr.join(', ')}</td>
            <td>{nums.join(', ')}</td>
            <td>{avg}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="avg-calc">
      <h1>Average Calculator</h1>
      <select value={type} onChange={handleTypeChange}>
        <option value="p">Prime</option>
        <option value="f">Fibo</option>
        <option value="e">Even</option>
        <option value="r">Rand</option>
      </select>
      <button onClick={fetchAvg} disabled={loading}>
        {loading ? 'Loading...' : 'Calculate Avg'}
      </button>
      {err && <p className="error">{err}</p>}
      {renderTable()}
    </div>
  );
}

export default AvgCalc;