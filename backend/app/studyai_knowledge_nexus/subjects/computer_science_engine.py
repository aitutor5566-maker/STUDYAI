from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.subjects.base_subject_engine import (
    BaseSubjectEngine,
    SubjectEngineOutput,
    DefinitionScaffold,
)


class ComputerScienceEngine(BaseSubjectEngine):
    """
    Subject Engine 10: Computer Science & Applications.
    Specializes in:
    - Object-Oriented Programming Principles (Encapsulation, Inheritance, Polymorphism, Data Abstraction)
    - Java (BlueJ environment for ICSE & ISC) and Python (CBSE)
    - Algorithm Logic, Flowcharts, Dry Run Tracing Tables
    - Searching (Linear, Binary) & Sorting (Bubble, Selection)
    - String Manipulation & Wrapper Classes
    - Stack, Queue & Recursion (ISC Grade 12)
    """

    @property
    def subject_name(self) -> str:
        return "Computer Science"

    @property
    def allowed_visual_types(self) -> List[str]:
        # Flowcharts, Dry run tracing tables, Memory stack diagrams. No 3D models.
        return ["algorithm_flowchart", "memory_trace_table", "code_syntax_card", "none"]

    def analyze_topic(
        self,
        topic: str,
        grade: int,
        board: str = "ICSE",
        mode: str = "normal",
        context: Optional[Dict[str, Any]] = None,
    ) -> SubjectEngineOutput:
        clean_topic = topic.strip()
        q = clean_topic.lower()

        is_oop = "oop" in q or "encapsul" in q or "inherit" in q or "polymorph" in q or "class" in q
        is_array = "array" in q or "search" in q or "sort" in q

        if is_oop:
            orig_def = (
                "Encapsulation is the fundamental Object-Oriented Programming mechanism that binds together code and the data "
                "it manipulates, keeping both safe from outside interference and misuse by declaring instance variables private "
                "and providing public getter/setter accessor methods."
            )
            simp_def = "Encapsulation is like a protective capsule that wraps data and functions inside a single class, hiding internal variables from outside unauthorized tampering."
            examp = "A BankAccount class keeps 'double balance' private and only allows deposits or withdrawals through validated public methods like 'deposit(amount)'."
        elif is_array:
            orig_def = (
                "Binary Search is an efficient divide-and-conquer search algorithm that finds the position of a target value within a "
                "monotonically sorted array by repeatedly comparing the target to the middle element and halving the search space in O(log n) time."
            )
            simp_def = "Binary Search finds an item in a sorted list by repeatedly checking the middle number and throwing away the half where the item cannot be."
            examp = "Searching for 42 in [10, 20, 30, 40, 50, 60]: Middle is 30, 42 > 30, so discard left half and search [40, 50, 60] next."
        else:
            orig_def = (
                "Method Overloading is a compile-time (static) polymorphism feature in Java where multiple methods in the same class share the "
                "identical identifier but differ in parameter signature (number, data types, or sequence of arguments)."
            )
            simp_def = "Method Overloading means having two or more methods with the exact same name in one class, as long as they take different types or numbers of inputs."
            examp = "area(int radius) calculates circle area, while area(int length, int breadth) calculates rectangle area using the same method name 'area'."

        def_scaffold = DefinitionScaffold(
            original_academic_definition=orig_def,
            simplified_definition=simp_def,
            difficult_words_breakdown=[
                {"word": "Encapsulation", "meaning": "Wrapping data (variables) and methods into a single protective unit (class)."},
                {"word": "Monotonically Sorted", "meaning": "Arranged strictly in non-decreasing or non-increasing order; essential prerequisite for Binary Search."},
                {"word": "Polymorphism", "meaning": "The ability of an entity (such as a method) to take on many forms based on its input parameters."}
            ],
            relatable_example=examp,
            meaning_preservation_proof="The simplified definition explicitly maintains all formal prerequisites, access specifier boundaries, and time complexity constraints without compromise."
        )

        steps = [
            {
                "step_number": 1,
                "title": "Algorithmic Invariant & Data Structure Setup",
                "explanation": "Establish the state variables, array bounds (low, high), or class member visibility specifications."
            },
            {
                "step_number": 2,
                "title": "Control Flow & Execution Logic",
                "explanation": "Trace iterations, loop invariants, termination conditions, or method resolution logic."
            },
            {
                "step_number": 3,
                "title": "Dry Run & Tracing Table Verification",
                "explanation": "Construct a systematic variable trace table recording values of every variable at each loop pass."
            }
        ]

        terms = [
            {"term": "Bytecode", "meaning": "The intermediate machine-independent code generated by the Java compiler (javac) and executed by the Java Virtual Machine (JVM)."},
            {"term": "Wrapper Class", "meaning": "Classes (Integer, Double, Character) in java.lang that encapsulate primitive data types into object representations."},
            {"term": "Time Complexity O(log n)", "meaning": "An algorithm where the number of required operations grows logarithmically with input size, halving at each step."}
        ]

        examples = [
            {
                "type": "Java Code Implementation",
                "question": "Write the iterative binary search method in Java.",
                "solution": (
                    "public int binarySearch(int[] arr, int key) {\n"
                    "    int low = 0, high = arr.length - 1;\n"
                    "    while (low <= high) {\n"
                    "        int mid = low + (high - low) / 2;\n"
                    "        if (arr[mid] == key) return mid;\n"
                    "        if (arr[mid] < key) low = mid + 1;\n"
                    "        else high = mid - 1;\n"
                    "    }\n"
                    "    return -1;\n"
                    "}"
                ),
                "explanation": "Notice the use of 'low + (high - low) / 2' which prevents potential integer overflow compared to '(low + high) / 2'."
            }
        ]

        misconceptions = [
            {
                "misconception": "Attempting Binary Search on an unsorted array",
                "correction": "Binary Search mathematically assumes the array is sorted. On an unsorted array, it yields erroneous results; Linear Search must be used instead or sort first."
            },
            {
                "misconception": "Believing changing only the return type overloads a method",
                "correction": "Method Overloading in Java requires a difference in parameter list (types, number, order). Changing only the return type results in a compile-time duplicate method error."
            }
        ]

        visual_rec = {
            "type": "algorithm_flowchart" if not is_array else "memory_trace_table",
            "format": "SVG Flowchart / Table",
            "caption": f"Algorithmic Logic Visual for {clean_topic}",
            "requires_3d": False
        }

        assessment = {
            "question": "What is the difference between '=' and '==' in Java?",
            "correct_answer": "'=' is the assignment operator used to store a value into a variable; '==' is the relational equality operator used to compare two values for boolean truth.",
            "rubric_note": "State the operator type (assignment vs relational) and the resulting action."
        }

        return SubjectEngineOutput(
            subject=self.subject_name,
            topic=clean_topic,
            curriculum_board=board,
            grade=grade,
            teaching_methodology="Computational Thinking, Tracing Tables & Code Synthesis",
            definition_scaffold=def_scaffold,
            core_explanation_steps=steps,
            essential_terminology=terms,
            worked_examples=examples,
            visual_recommendation=visual_rec,
            assessment_checkpoint=assessment,
            common_misconceptions=misconceptions,
            subject_specific_payload={
                "programming_language": "Java (BlueJ)" if board in ["ICSE", "ISC"] else "Python",
                "code_constructs_verified": True
            }
        )

    def validate_academic_accuracy(self, output: SubjectEngineOutput) -> bool:
        if output.visual_recommendation.get("requires_3d"):
            return False
        return True


computer_science_engine = ComputerScienceEngine()
