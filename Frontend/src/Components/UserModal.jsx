import React from 'react';
import { X, Trophy, BookOpen, Award, Github, Twitter, Linkedin, Instagram, ExternalLink } from 'lucide-react';

const UserModal = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 mt-24 overflow-y-auto bg-black/30 backdrop-blur-sm"
      onClick={onClose}>
      <div className="min-h-screen px-4 flex items-center justify-center">
        {/* Modal Content */}

        <div
          className="w-full max-w-4xl bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl relative transform transition-all duration-500 animate-modalEntry"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{ cursor: 'pointer' }}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 
                     transition-colors duration-300 text-gray-600 hover:text-gray-800"
          >
            <X style={{ cursor: 'pointer' }} className="w-7 h-7" />
          </button>

          {/* Profile Header */}
          <div className="relative h-24 rounded-t-2xl overflow-hidden">
            {/* Background Pattern */}
            <div onClick={onClose} className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
          </div>

          {/* Profile Image Container - Moved outside header for proper stacking */}
          <div className="relative z-10 h-16">
            <div className="absolute -top-16 left-8">
              <div className="relative">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white 
                 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full 
                    border-4 border-white"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            {/* User Info */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
              <p className="text-blue-600">{user.email}</p>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 text-center transform hover:scale-105 
                           transition-all duration-300 hover:bg-gray-100 shadow-sm">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-800 mb-1">{user.modulesCompleted}</div>
                <div className="text-gray-500 text-sm">Modules</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center transform hover:scale-105 
                           transition-all duration-300 hover:bg-gray-100 shadow-sm">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-gray-800 mb-1">{user.quizzesCompleted}</div>
                <div className="text-gray-500 text-sm">Quizzes</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center transform hover:scale-105 
                           transition-all duration-300 hover:bg-gray-100 shadow-sm">
                <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-800 mb-1">{user.badges}</div>
                <div className="text-gray-500 text-sm">Badges</div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed">{user.about}</p>
            </div>

            {/* Skills Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100
                             hover:bg-blue-100 transition-colors duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Connect</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 
                           transition-colors duration-300 text-gray-600 hover:text-gray-800 shadow-sm"
                >
                  <Github className="w-5 h-5" />
                  <span>Github</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={user.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 
                           transition-colors duration-300 text-gray-600 hover:text-gray-800 shadow-sm"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span>Twitter</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 
                           transition-colors duration-300 text-gray-600 hover:text-gray-800 shadow-sm"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={user.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 
                           transition-colors duration-300 text-gray-600 hover:text-gray-800 shadow-sm"
                >
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <span>Instagram</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Blogs Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Latest Blogs</h3>
              <div className="space-y-4">
                {user.allBlogs.map((blog, index) => (
                  <div
                    key={index}
                    className="group bg-gray-50 rounded-xl p-4 hover:bg-gray-100 
                             transition-colors duration-300 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {blog.imageUrl && (
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-800 group-hover:text-blue-600 
                                   transition-colors duration-300">
                          {blog.title}
                        </h4>
                        <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                          {blog.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;