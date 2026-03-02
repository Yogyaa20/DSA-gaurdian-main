"""
Seed the database with common DSA problems
"""
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Problem
import uuid

# Create tables
Base.metadata.create_all(bind=engine)

def seed_problems():
    db = SessionLocal()
    
    # Check if problems already exist
    existing_count = db.query(Problem).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} problems. Skipping seed.")
        db.close()
        return
    
    problems = [
        # Arrays - Easy
        {"title": "Two Sum", "difficulty": "easy", "topic": "arrays", 
         "description": "Find two numbers that add up to target", 
         "solution_link": "https://leetcode.com/problems/two-sum/"},
        {"title": "Best Time to Buy and Sell Stock", "difficulty": "easy", "topic": "arrays",
         "description": "Find maximum profit from stock prices",
         "solution_link": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"},
        {"title": "Contains Duplicate", "difficulty": "easy", "topic": "arrays",
         "description": "Check if array contains duplicates",
         "solution_link": "https://leetcode.com/problems/contains-duplicate/"},
        
        # Arrays - Medium
        {"title": "3Sum", "difficulty": "medium", "topic": "arrays",
         "description": "Find all triplets that sum to zero",
         "solution_link": "https://leetcode.com/problems/3sum/"},
        {"title": "Container With Most Water", "difficulty": "medium", "topic": "arrays",
         "description": "Find container that can store most water",
         "solution_link": "https://leetcode.com/problems/container-with-most-water/"},
        
        # Strings - Easy
        {"title": "Valid Palindrome", "difficulty": "easy", "topic": "strings",
         "description": "Check if string is a palindrome",
         "solution_link": "https://leetcode.com/problems/valid-palindrome/"},
        {"title": "Valid Anagram", "difficulty": "easy", "topic": "strings",
         "description": "Check if two strings are anagrams",
         "solution_link": "https://leetcode.com/problems/valid-anagram/"},
        
        # Strings - Medium
        {"title": "Longest Substring Without Repeating Characters", "difficulty": "medium", "topic": "strings",
         "description": "Find length of longest substring without repeating chars",
         "solution_link": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"},
        {"title": "Group Anagrams", "difficulty": "medium", "topic": "strings",
         "description": "Group strings that are anagrams",
         "solution_link": "https://leetcode.com/problems/group-anagrams/"},
        
        # Linked Lists - Easy
        {"title": "Reverse Linked List", "difficulty": "easy", "topic": "linked-lists",
         "description": "Reverse a singly linked list",
         "solution_link": "https://leetcode.com/problems/reverse-linked-list/"},
        {"title": "Merge Two Sorted Lists", "difficulty": "easy", "topic": "linked-lists",
         "description": "Merge two sorted linked lists",
         "solution_link": "https://leetcode.com/problems/merge-two-sorted-lists/"},
        
        # Trees - Easy
        {"title": "Maximum Depth of Binary Tree", "difficulty": "easy", "topic": "trees",
         "description": "Find maximum depth of binary tree",
         "solution_link": "https://leetcode.com/problems/maximum-depth-of-binary-tree/"},
        {"title": "Same Tree", "difficulty": "easy", "topic": "trees",
         "description": "Check if two trees are identical",
         "solution_link": "https://leetcode.com/problems/same-tree/"},
        
        # Trees - Medium
        {"title": "Binary Tree Level Order Traversal", "difficulty": "medium", "topic": "trees",
         "description": "Traverse tree level by level",
         "solution_link": "https://leetcode.com/problems/binary-tree-level-order-traversal/"},
        {"title": "Validate Binary Search Tree", "difficulty": "medium", "topic": "trees",
         "description": "Check if tree is valid BST",
         "solution_link": "https://leetcode.com/problems/validate-binary-search-tree/"},
        
        # Dynamic Programming - Easy
        {"title": "Climbing Stairs", "difficulty": "easy", "topic": "dynamic-programming",
         "description": "Count ways to climb n stairs",
         "solution_link": "https://leetcode.com/problems/climbing-stairs/"},
        
        # Dynamic Programming - Medium
        {"title": "Coin Change", "difficulty": "medium", "topic": "dynamic-programming",
         "description": "Find minimum coins needed for amount",
         "solution_link": "https://leetcode.com/problems/coin-change/"},
        {"title": "Longest Increasing Subsequence", "difficulty": "medium", "topic": "dynamic-programming",
         "description": "Find length of longest increasing subsequence",
         "solution_link": "https://leetcode.com/problems/longest-increasing-subsequence/"},
        
        # Graphs - Medium
        {"title": "Number of Islands", "difficulty": "medium", "topic": "graphs",
         "description": "Count number of islands in grid",
         "solution_link": "https://leetcode.com/problems/number-of-islands/"},
        {"title": "Clone Graph", "difficulty": "medium", "topic": "graphs",
         "description": "Deep copy a graph",
         "solution_link": "https://leetcode.com/problems/clone-graph/"},
        
        # Graphs - Hard
        {"title": "Word Ladder", "difficulty": "hard", "topic": "graphs",
         "description": "Find shortest transformation sequence",
         "solution_link": "https://leetcode.com/problems/word-ladder/"},
        
        # Binary Search - Medium
        {"title": "Search in Rotated Sorted Array", "difficulty": "medium", "topic": "binary-search",
         "description": "Search in rotated sorted array",
         "solution_link": "https://leetcode.com/problems/search-in-rotated-sorted-array/"},
        
        # Backtracking - Medium
        {"title": "Subsets", "difficulty": "medium", "topic": "backtracking",
         "description": "Generate all possible subsets",
         "solution_link": "https://leetcode.com/problems/subsets/"},
        {"title": "Permutations", "difficulty": "medium", "topic": "backtracking",
         "description": "Generate all permutations",
         "solution_link": "https://leetcode.com/problems/permutations/"},
    ]
    
    for prob_data in problems:
        problem = Problem(
            id=str(uuid.uuid4()),
            **prob_data
        )
        db.add(problem)
    
    db.commit()
    print(f"Successfully seeded {len(problems)} problems!")
    db.close()

if __name__ == "__main__":
    seed_problems()
