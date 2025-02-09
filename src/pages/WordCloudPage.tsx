import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Link } from 'react-router-dom';
import './WordCloudPage.css';

interface Debate {
  ticker: string;
  summary: string;
  reason: string;
  analysis: string;
  rating: string;
}

interface WordCloudProps {
  debates: Debate[];
  sortBy: 'dateDesc' | 'dateAsc' | 'sentiment';
  sentimentRange: number;
}

interface Word {
  text: string;
  size: number;
  sentiment: number;
}

const WordCloudPage: React.FC<WordCloudProps> = ({ debates, sortBy, sentimentRange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const words = useMemo(() => {
    if (!debates || debates.length === 0) return [];
    
    let filteredDebates = [...debates];
    
    if (sortBy === 'sentiment') {
      filteredDebates = filteredDebates
        .sort((a, b) => {
          const ratingA = parseInt(a.rating) || 0;
          const ratingB = parseInt(b.rating) || 0;
          return ratingB - ratingA;
        });
      
      if (sentimentRange > 0) {
        filteredDebates = filteredDebates
          .filter(debate => {
            const rating = parseInt(debate.rating) || 0;
            return rating <= sentimentRange;
          });
      }
    }
    
    return filteredDebates.map(debate => ({
      text: debate.ticker,
      size: 14 + (parseInt(debate.rating) / 5 || 0),
      sentiment: (parseInt(debate.rating) || 0) / 100
    })) as Word[];
  }, [debates, sortBy, sentimentRange]);

  useEffect(() => {
    if (!svgRef.current?.parentElement) return;

    const container = svgRef.current.parentElement;
    setDimensions({
      width: container.clientWidth,
      height: container.clientHeight
    });

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !words.length) return;

    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    // Clear previous content
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${dimensions.width/2},${dimensions.height/2})`);

    // Create word cloud layout
    const layout = words.map((d, i) => ({
      ...d,
      x: (i % 3) * 100 - 100,
      y: Math.floor(i / 3) * 50 - 100
    }));

    // Render words
    g.selectAll("text")
      .data(layout)
      .enter().append("text")
      .style("font-size", d => `${d.size}px`)
      .style("font-family", "Arial")
      .style("fill", d => d3.interpolateBlues(d.sentiment))
      .attr("text-anchor", "middle")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .text(d => d.text)
      .append("title")
      .text(d => `Sentiment: ${Math.round(d.sentiment * 100)}%`);

  }, [words, dimensions]);

  return (
    <div className="wordcloud-container">
      <Link to="/" className="menu-button" aria-label="Back to Debates">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </Link>
      <div className="wordcloud-card">
        <h2 className="wordcloud-title">Debate Word Cloud</h2>
        <div className="wordcloud">
          <svg ref={svgRef}></svg>
        </div>
      </div>
    </div>
  );
};

export default WordCloudPage;
