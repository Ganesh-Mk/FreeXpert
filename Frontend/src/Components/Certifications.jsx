import React, { useState, useEffect } from "react";
import { Download, Award } from "lucide-react";
import axios from "axios";

const Certifications = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        // Get completed courses from localStorage
        const completedCourses = JSON.parse(localStorage.getItem("completedCourses") || "[]");

        if (completedCourses.length === 0) {
          setLoading(false);
          return;
        }

        // Convert array to comma-separated string for API call
        const courseIds = completedCourses.join(",");

        // Fetch course data from backend
        const response = await axios.get(`${BACKEND_URL}/getCourses?courseIds=${courseIds}`);
        setCertificates(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError("Failed to load your certificates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [BACKEND_URL]);

  const downloadCertificate = (course) => {
    // Get user data
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const username = userData.name || "Learner";

    // Create a canvas for the certificate
    const canvas = document.createElement("canvas");
    canvas.width = 1500; // Wider canvas for better spacing
    canvas.height = 1050; // Taller canvas for better spacing
    const ctx = canvas.getContext("2d");

    // Set white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative border - outer
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Add subtle inner border
    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

    // Draw the shield logo - positioned better
    drawShieldLogo(ctx, 180, 105, 0.33);

    // Logo text - right side of the shield with better spacing
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#c084fc"; // Purple for 
    ctx.textAlign = "left";
    ctx.fillText("FreeX", 270, 160);
    ctx.fillStyle = "#818cf8"; // Blue for Cyber
    ctx.fillText("pert", 415, 160);

    // Much more space before the certificate title
    ctx.font = "bold 70px Arial";
    ctx.fillStyle = "#121c2e";
    ctx.textAlign = "center";
    ctx.fillText("CERTIFICATE OF COMPLETION", canvas.width / 2, 320);

    // Decorative horizontal line below title
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 350);
    ctx.lineTo(canvas.width - 300, 350);
    ctx.stroke();

    // Add trophy icon in a blue circle - much more space after title
    ctx.fillStyle = "#6366f1"; // Blue circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 450, 70, 0, Math.PI * 2);
    ctx.fill();

    // Draw trophy
    drawTrophy(ctx, canvas.width / 2, 450);

    // Much more space after trophy
    ctx.fillStyle = "#121c2e";
    ctx.font = "40px Arial";
    ctx.fillText("This certifies that", canvas.width / 2, 580);

    // Add name - make it stand out with good spacing
    ctx.font = "bold 80px Arial";
    ctx.fillText(username, canvas.width / 2, 680);

    // Course completion text with more breathing room
    ctx.font = "40px Arial";
    ctx.fillText("has successfully completed the course", canvas.width / 2, 760);

    // Course title gets more space - smaller size but still prominent
    ctx.font = "bold 65px Arial";
    ctx.fillText(course.title, canvas.width / 2, 850);

    // Decorative horizontal line below course title
    ctx.beginPath();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 3;
    ctx.moveTo(500, 880);
    ctx.lineTo(canvas.width - 500, 880);
    ctx.stroke();

    // Add date - with more space
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    ctx.font = "30px Arial";
    ctx.fillText(`Issued on: ${date}`, canvas.width / 2, 930);

    // Create download link
    const link = document.createElement("a");
    link.download = `${course.title.replace(/\s+/g, "_")}_Certificate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Helper function to draw the shield logo
  function drawShieldLogo(ctx, x, y, scale) {
    ctx.save();

    // Scale and position the shield SVG
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Shield in purple
    ctx.fillStyle = "#c084fc";
    ctx.beginPath();
    // Shield outer path
    ctx.moveTo(196.926, 55.171);
    ctx.bezierCurveTo(196.816, 49.386, 196.711, 43.921, 196.711, 38.634);
    ctx.bezierCurveTo(196.711, 34.492, 193.354, 31.134, 189.211, 31.134);
    ctx.bezierCurveTo(157.136, 31.134, 132.715, 21.916, 112.359, 2.124);
    ctx.bezierCurveTo(109.447, -0.708, 104.813, -0.707, 101.902, 2.124);
    ctx.bezierCurveTo(81.548, 21.916, 57.131, 31.134, 25.058, 31.134);
    ctx.bezierCurveTo(20.916, 31.134, 17.558, 34.492, 17.558, 38.634);
    ctx.bezierCurveTo(17.558, 43.922, 17.454, 49.389, 17.343, 55.175);
    ctx.bezierCurveTo(16.315, 109.011, 14.907, 182.742, 104.674, 213.857);
    ctx.bezierCurveTo(105.47, 214.133, 106.3, 214.271, 107.13, 214.271);
    ctx.bezierCurveTo(107.96, 214.271, 108.791, 214.133, 109.586, 213.857);
    ctx.bezierCurveTo(199.36, 182.741, 197.954, 109.008, 196.926, 55.171);
    ctx.closePath();

    // Inner part of the shield (lighter)
    ctx.moveTo(107.131, 198.812);
    ctx.bezierCurveTo(30.144, 170.845, 31.308, 109.58, 32.341, 55.461);
    ctx.bezierCurveTo(32.403, 52.213, 32.463, 49.065, 32.505, 45.979);
    ctx.bezierCurveTo(62.545, 44.711, 86.567, 35.608, 107.131, 17.694);
    ctx.bezierCurveTo(127.697, 35.608, 151.723, 44.712, 181.765, 45.979);
    ctx.bezierCurveTo(181.807, 49.064, 181.867, 52.21, 181.929, 55.456);
    ctx.bezierCurveTo(182.961, 109.577, 184.124, 170.844, 107.131, 198.812);
    ctx.closePath();
    ctx.fill();

    // Checkmark inside the shield (in white)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(132.958, 81.082);
    ctx.lineTo(96.759, 117.279);
    ctx.lineTo(81.312, 101.832);
    ctx.bezierCurveTo(78.383, 98.904, 73.634, 98.904, 70.706, 101.832);
    ctx.bezierCurveTo(67.777, 104.762, 67.777, 109.51, 70.706, 112.439);
    ctx.lineTo(91.456, 133.189);
    ctx.bezierCurveTo(92.92, 134.653, 94.84, 135.385, 96.759, 135.385);
    ctx.bezierCurveTo(98.678, 135.385, 100.598, 134.653, 102.062, 133.189);
    ctx.lineTo(143.563, 91.689);
    ctx.bezierCurveTo(146.493, 88.76, 146.493, 84.011, 143.564, 81.083);
    ctx.bezierCurveTo(140.636, 78.154, 135.887, 78.153, 132.958, 81.082);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Helper function to draw the trophy
  function drawTrophy(ctx, x, y) {
    // Trophy cup
    ctx.fillStyle = "#fbbf24"; // Gold trophy
    ctx.beginPath();
    ctx.moveTo(x - 25, y - 20);
    ctx.lineTo(x + 25, y - 20);
    ctx.lineTo(x + 20, y + 5);
    ctx.lineTo(x - 20, y + 5);
    ctx.closePath();
    ctx.fill();

    // Trophy handles
    ctx.beginPath();
    ctx.arc(x - 25, y - 10, 10, Math.PI * 1.5, Math.PI * 0.5, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 25, y - 10, 10, Math.PI * 0.5, Math.PI * 1.5, true);
    ctx.fill();

    // Trophy base
    ctx.fillStyle = "#92400e"; // Brown
    ctx.fillRect(x - 15, y + 5, 30, 15);
    ctx.fillRect(x - 25, y + 20, 50, 5);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Award className="mr-2 text-indigo-500" /> My Certificates
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading certificates...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg">You haven't completed any courses yet.</p>
          <p className="mt-2">Complete a course to earn your first certificate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((course) => (
            <div
              key={course._id}
              className="bg-gray-50 border-2 border-indigo-400 rounded-lg overflow-hidden flex flex-col transform transition-transform hover:scale-105"
            >
              <div className="bg-indigo-100 p-4 text-center">
                <Award className="w-12 h-12 mx-auto text-yellow-500" />
                <h3 className="text-xl font-bold text-indigo-800 mt-2">Certificate of Completion</h3>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="text-center flex-1">
                  <p className="text-gray-500 text-sm mb-2">This certifies that</p>
                  <p className="text-gray-800 text-xl font-bold mb-2">
                    {JSON.parse(localStorage.getItem("userData") || '{"name":"Learner"}').name}
                  </p>
                  <p className="text-gray-500 text-sm mb-2">has successfully completed</p>
                  <p className="text-indigo-600 text-xl font-bold my-4">{course.title}</p>
                  <p className="text-gray-500 text-sm mt-4">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>

                <button
                  onClick={() => downloadCertificate(course)}
                  className="mt-6 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors duration-300"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certifications;