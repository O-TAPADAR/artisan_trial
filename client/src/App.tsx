import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/')
            .then(response => response.json())
            .then(data => setMessage(data.message));
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
};

export default App;