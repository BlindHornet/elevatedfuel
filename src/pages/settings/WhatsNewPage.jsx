// Module Imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Sparkles,
  Calendar,
  CheckCircle,
  Wrench,
  Plus,
  Bug,
  Package,
} from "lucide-react";

export default function WhatsNewPage() {
  const navigate = useNavigate();
  const [changelogSections, setChangelogSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChangelog();
  }, []);

  const loadChangelog = async () => {
    try {
      // Option 1: Fetch from public folder
      const response = await fetch("../../../CHANGELOG.md");
      const content = await response.text();
      parseChangelog(content);
    } catch (error) {
      console.error("Failed to load changelog:", error);
      // Fallback: Use inline content if fetch fails
      parseChangelog(getFallbackChangelog());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackChangelog = () => {
    // Fallback changelog in case the file can't be loaded
    return `# Changelog

## [0.2.17] - 2026-02-14

### Changed

- View Recipe
  - Moved the Title To Be At Top on Mobile
  - Moved P/C/F Under Title
  - Moved 'Add to Meal Plan' Button under 'View Source Link' Button
  - Moved 'Shopping List' and 'I Made This' Buttons under 'Add to Meal Plan'
  - Moved Tags Under Shopping List' and 'I Made This' Buttons

## [0.2.12] - 2026-02-14

### Fixed

- Website Public Data
  - Changed URL Hosting as the Free Site is currently down

## [0.2.11] - 2026-02-13

### Fixed

- Filter + View Recipe
  - If a filter is selected, and the user goes to view a recipe, when back is pushed, it was resetting filters. This is now fixed.
- Meal Plan
  - Dropping Recipe on Day wasnt working for PC or Mobile - Fixed
  - Removing Recipe From Fuel List does not remove from days - Fixed

## [0.1.8] - 2026-02-13

### Changed

- Recipe Card
  - If status = Pending - Add New tag on picture
  - If Quick Added, Show Needs Details

## [0.1.6] - 2026-02-13

### Changed

- Home Page
  - Show Total Recipe count at Top
  - Recipes show in descending order of creation
  - Pagination
    - First and Last Page Pagination Shown when not on that page
    - When a new page scroll is selected, it goes back to the top

## [0.1.2] - 2026-02-13

### Changed

- View Recipe
  - Allow Image To be Link to View Source
  - Moved View Link Source Button to under image and made to stand out more

## [0.1.0] - 2026-02-13

### Added

- Initial release of Change Log

### Fixed

- —`;
  };

  const parseChangelog = (content) => {
    const lines = content.split("\n");
    const sections = [];
    let currentVersion = null;
    let currentCategory = null;

    lines.forEach((line) => {
      // Version header: ## [0.2.17] - 2026-02-14
      if (line.startsWith("## [")) {
        const match = line.match(/## \[([^\]]+)\] - (.+)/);
        if (match) {
          currentVersion = {
            version: match[1],
            date: match[2],
            categories: [],
          };
          sections.push(currentVersion);
        }
      }
      // Category header: ### Added, ### Changed, ### Fixed
      else if (line.startsWith("### ")) {
        const categoryName = line.replace("### ", "").trim();
        currentCategory = {
          name: categoryName,
          items: [],
        };
        if (currentVersion) {
          currentVersion.categories.push(currentCategory);
        }
      }
      // List items - preserve indentation level
      else if (line.trim().startsWith("- ") && currentCategory) {
        // Count leading spaces to determine indentation level
        const leadingSpaces = line.search(/\S/);
        const indentLevel = Math.floor(leadingSpaces / 2);
        const text = line.trim().substring(2);

        currentCategory.items.push({
          text,
          indentLevel,
        });
      }
    });

    setChangelogSections(sections);
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("added") || name.includes("new")) {
      return <Plus size={18} className="text-brand" />;
    } else if (name.includes("changed") || name.includes("improved")) {
      return <Wrench size={18} className="text-yellow-500" />;
    } else if (name.includes("fixed") || name.includes("bug")) {
      return <Bug size={18} className="text-green-500" />;
    }
    return <CheckCircle size={18} className="text-brand" />;
  };

  const getCategoryColor = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("added") || name.includes("new")) {
      return "text-brand";
    } else if (name.includes("changed") || name.includes("improved")) {
      return "text-yellow-500";
    } else if (name.includes("fixed") || name.includes("bug")) {
      return "text-green-500";
    }
    return "text-text";
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted hover:text-brand transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back
            </span>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand" size={20} />
            <h1 className="text-xl font-black uppercase tracking-tight">
              What's New
            </h1>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 mt-8 text-center py-20">
          <div className="text-muted">Loading changelog...</div>
        </div>
      )}

      {/* CONTENT */}
      {!loading && (
        <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 rounded-[var(--radius-lg)] p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/20 mb-4">
              <Sparkles size={32} className="text-brand" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
              Changelog
            </h2>
            <p className="text-muted">
              Track all the latest updates, improvements, and fixes
            </p>
          </div>

          {/* Version Sections */}
          {changelogSections.map((section, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden"
            >
              {/* Version Header */}
              <div className="bg-gradient-to-r from-brand/10 to-transparent border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/20">
                    <Package size={20} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      Version {section.version}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted mt-1">
                      <Calendar size={14} />
                      <span>{section.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="p-6 space-y-6">
                {section.categories.map((category, catIdx) => (
                  <div key={catIdx}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-3">
                      {getCategoryIcon(category.name)}
                      <h4
                        className={`text-lg font-black uppercase tracking-tight ${getCategoryColor(category.name)}`}
                      >
                        {category.name}
                      </h4>
                    </div>

                    {/* Category Items */}
                    <div className="space-y-2">
                      {category.items.map((item, itemIdx) => {
                        const indentLevel = item.indentLevel || 0;
                        const marginLeft = indentLevel * 24; // 24px per indent level

                        // Level 0 = main item (bold)
                        // Level 1+ = sub-items (progressively lighter)
                        const isMainItem = indentLevel === 0;
                        const textSize =
                          indentLevel === 0 ? "text-base" : "text-sm";
                        const textColor =
                          indentLevel === 0
                            ? "text-text font-semibold"
                            : indentLevel === 1
                              ? "text-text/80"
                              : "text-muted";
                        const dotSize =
                          indentLevel === 0 ? "w-1.5 h-1.5" : "w-1 h-1";
                        const dotColor =
                          indentLevel === 0 ? "bg-brand" : "bg-muted";

                        return (
                          <div
                            key={itemIdx}
                            className={`${textSize} ${textColor}`}
                            style={{ marginLeft: `${marginLeft}px` }}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`${dotSize} rounded-full ${dotColor} mt-2 flex-shrink-0`}
                              />
                              <span className="flex-1 leading-relaxed">
                                {item.text}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer Message */}
          <div className="text-center py-8">
            <p className="text-muted text-sm">
              Stay tuned for more updates! 🚀
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
