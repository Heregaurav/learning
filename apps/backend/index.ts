import express, { Request, Response } from "express";
import { prismaClient } from "db/client";

const app = express();
const prisma = prismaClient; // Clean reference to your monorepo client instance
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies safely
app.use(express.json());

// =========================================================================
// 1. CREATE: Add a new Todo for a User
// =========================================================================
app.post("/todos", async (req: Request, res: Response): Promise<void> => {
  try {
    const { task, description, userId } = req.body;

    if (!task || userId === undefined) {
      res.status(400).json({ error: "Missing required fields: 'task' and 'userId'." });
      return;
    }

    const numericUserId = Number(userId);
    if (Number.isNaN(numericUserId)) {
      res.status(400).json({ error: "userId must be a number." });
      return;
    }

    const newTodo = await prisma.todo.create({
      data: {
        title: task,
        description: description ?? null,
        userId: numericUserId,
      },
    });

    res.status(201).json(newTodo);

  }catch (error) {
  console.error(error);
  res.status(500).json({
    error: String(error)
  });
}
});

// =========================================================================
// 2. READ: Get all Todos belonging to a specific Usercle
// =========================================================================
app.get("/todos/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdRaw = req.params.userId;
    const numericUserId = Number(userIdRaw);

    if (Number.isNaN(numericUserId)) {
      res.status(400).json({ error: "Invalid userId parameter; must be a number." });
      return;
    }

    const todos = await prisma.todo.findMany({
      where: { userId: numericUserId },
    });

    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================================================================
// 3. UPDATE: Toggle status ('done') or update the text content ('task')
// =========================================================================
app.put("/todos/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { task, description, done } = req.body;

    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid todo id; must be a number." });
      return;
    }

    // Verify the todo item exists first
    const existingTodo = await prisma.todo.findUnique({ where: { id } });
    if (!existingTodo) {
      res.status(404).json({ error: "Todo item not found." });
      return;
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        title: task ?? (existingTodo as any).title,
        description: description ?? (existingTodo as any).description,
        done: done ?? (existingTodo as any).done,
      },
    });

    res.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================================================================
// 4. DELETE: Remove a Todo item
// =========================================================================
app.delete("/todos/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid todo id; must be a number." });
      return;
    }

    const existingTodo = await prisma.todo.findUnique({ where: { id } });
    if (!existingTodo) {
      res.status(404).json({ error: "Todo item not found." });
      return;
    }

    await prisma.todo.delete({
      where: { id },
    });

    res.json({ message: "Todo item deleted successfully." });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the application
app.listen(PORT, () => {
  console.log(`🚀 Todo service live on http://localhost:${PORT}`);
});
