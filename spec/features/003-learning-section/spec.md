# Feature: Guided Learning Engine

## What?

A **Guided Learning Engine** will be developed to integrate interactive, action-oriented educational experiences into Rumbo. This engine will be the infrastructure upon which all the application's financial education content will be built.

The goal of this first phase is not to develop the learning topics, but rather to build a flexible, configurable, and extensible architecture that allows for the definition of new content without modifying the application's code.

The engine must be able to model the following elements:

- **Learning Paths**, which define the recommended user journey.

- **Topics**, which represent learning units (for example: Budgeting, Emergency Fund, Savings Goals, etc.).

- **Dependencies between topics**, allowing for the establishment of prerequisites when one topic requires knowledge or actions performed in another.

- **Content Blocks**, which form the educational flow of a topic. A block can represent different types of content, for example:

- Concepts

- Explanations

- Tips

- Examples

- Warnings

- Reflections

- Exercises

- Tasks

- (In the future: videos, quizzes, simulations, etc.)

The content will not be organized into rigid sections, but rather as a free sequence of blocks that allows for a natural combination of theory and practice.

Likewise, the engine must support different types of tasks, including:

### Achievement Tasks

These represent one-time actions performed to demonstrate understanding or application of a concept.

Examples:

- Create the first budget.

- Record the first income.

- Create a savings goal.

- Set up two financial accounts.

Once completed, they will remain in a completed state.

### Follow-up Tasks

These represent financial habits that must be maintained over time.

Their status will be evaluated periodically using rules defined by the system.

Examples:

- Record income each month.

- Record expenses regularly.

- Keep most expenses categorized.

- Update the budget periodically.

These tasks may transition between completed and uncompleted states as user behavior changes.

The engine must also support various validation mechanisms:

- Automatic validation using system rules.

- Manual validation when the action cannot be automatically verified.

All engine information (topics, blocks, tasks, dependencies, validation rules, and configuration) must be stored dynamically in the database, avoiding reliance on hardcoded content within the application.

This feature includes the necessary modifications to:

- Database.

- Backend.

- Web Application.

- Mobile Application.

--

# Why?

One of Rumbo's main objectives is to minimize the friction a person experiences when starting to organize their personal finances.

Most finance apps assume the user already understands concepts like budgeting, saving, financial goals, and expense tracking, simply providing tools for recording information.

Rumbo takes a different approach.

Instead of expecting the user to learn first and then use the app, the app itself should become the learning tool.

Learning should be directly linked to real-world actions within their own finances, allowing each concept learned to have immediate practical application.

For example, before teaching how to create a budget, the system should guide the user in recording enough income and expenses to build a budget with real data.

In this way, learning will move beyond theory and become a practical, guided process.

Additionally, the engine will allow certain activities to evolve from simple learning exercises into permanent habits that reflect the user's level of financial organization.

This infrastructure will also serve as the foundation for future features, including:

- Gamification.

- Achievements.

- Badges. - Progress indicators.

- Financial health indicators.

- Smart recommendations.

- Interactive assistants.

- New educational journeys.

---

# Acceptance Criteria

The feature will be considered complete when the following criteria are met:

## Architecture

- A data structure exists that represents routes, topics, content blocks, tasks, validation rules, and user progress.

- The structure was designed to be extensible and allow the incorporation of new content types without modifying the main model.

- There is no hardcoded educational content within the application.

## Configuration

- New topics can be created solely through database configuration.

- The order of content blocks can be modified without code changes.

- Dependencies between topics can be established.

- New task types can be added using the existing architecture.

## Content

- A topic can contain any number of blocks.

- Blocks can appear in any order.

- A single topic can combine theory, tips, and tasks within the same flow.

## Tasks

- The system supports achievement tasks.

- The system supports follow-up tasks.

- A task can be configured for automatic validation.

- A task can be configured for manual completion.

- Validation rules do not depend on specific code for each task.

## Progress

- The system stores user progress.

- The system knows which topics have been completed.

- The system knows which tasks are active, pending, or incomplete.

- The system determines which topics can be started based on their dependencies.

## Integration

- The web application consumes the learning engine.

- The mobile application consumes the learning engine.

- Both applications represent the content using the same data structure.

## Extensibility

The architecture allows for the future incorporation of the following without significant redesign:

- Videos.

- Quizzes.

- Simulators.

- Gamification.

- Achievements.

- Badges.

- Rewards.

- Financial health indicators.

- New types of blocks.

- New types of tasks.

--

# Scope of Work

This first phase does not include the development of the final educational content or the implementation of advanced learning functionalities.

The following are explicitly excluded from the scope:

- Development of all financial education topics.

- Writing the final content for each topic.

- Complete definition of the learning path.

- Production of multimedia materials.

- Integration of videos.

- Quizzes or assessments.

- Simulators.

- Rewards system.

- Points system.

- Badges.

- Achievements visible to the user.

- Financial health indicator.

- Personalized recommendations using AI.

- Multiple learning paths for different user profiles.

- Locking or unlocking application features based on progress.

- Administrative tools for editing content from a graphical interface.

--

# Design Considerations

The Guided Learning Engine should be conceived as a cross-functional capability of Rumbo, not simply as a section of the application.

Its responsibility will be to interpret educational content, evaluate user progress, and coordinate the relationship between learning and actions performed within the platform.

The learning interface will be solely a visual representation of this engine.

This decision will allow the same infrastructure to be reused in future features such as:

- Interactive onboarding.

- Step-by-step tutorials.

- Financial challenges.
- Temporary campaigns.

- Setup wizards.

- Contextual recommendations.

- Comprehensive educational programs.

The design should prioritize flexibility, scalability, and data-driven configuration over implementations specific to initial content.