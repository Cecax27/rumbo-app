# 0. Financial Awareness

### Objective

For the person to stop seeing money as something abstract.

| **Competency** | **Habit** | **Strategy** |
| ---------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |

| Understand what income, expenses, savings, debt, and wealth are. | - | - Learning section with concepts. - Survey section (fixed income vs. variable income) |

| Identify how much money you receive. | Record 1 income | - Section to record income |

| Record your transactions | Record 7 days of transactions | - Section to record transactions |

| Differentiate between needs, wants, and obligations. | Categorize 10 expenses | - Ability to categorize expenses into needs, wants, and obligations. |

| Recognize your main money leaks | - | - Dashboard section to analyze expenses. |

| Understand that spending less than you earn is the foundation of everything. | Closing the Month with a Positive Balance | - The dashboard section should display monthly income vs. expenses. |

# Required Features

## Learning Section

Have the first topic created: Income, Expenses, Savings, Debt, and Net Worth.

The learning section should be divided into topics. Within each topic, there can be a challenge that must be completed to finish the topic. Some topics will not have a challenge; they may only have a "mark as completed" button. This challenge is the habit. Within the app, it would be better to call it a habit instead of a challenge. Challenges will be automatically updated as the user uses the app. Once a challenge is completed, it will be saved in the database and its status should no longer change. In the settings, we could add a button to reset all habits in the learning section if the user wants to start over. We could also add the option to reset individually within each topic or level. Each challenge will have its own logic for how it is completed.

Upon entering the learning section, the user should be able to see "where I am now." They should see their current level and how many levels there are. Within their current level, they should also be able to identify their progress toward completing it. This could further motivate them to continue.

There should also be an introductory topic before starting any level. This topic will explain to the user how we recommend approaching the material: it's not necessary to read all the concepts at once, nor to try to understand everything in a single day. Instead, they should read one topic, understand it, try to implement the habit, and only move on to the next topic once they succeed. Here, we'll emphasize that ultimately, having good personal finances isn't about who knows the most or reads the most, but about who has the best habits, and that habits are developed with consistency and patience. Always striving to improve by that 1% every day.

For this learning section, it's best if we develop the content in HTML format, or some other format stored in the database, so the app can retrieve it from the internet. This way, if we want to change the content later, we won't need to recompile the app. It will also be necessary for the app to perform a background fetch when the user opens it, retrieving the themes. If it detects the latest version, it won't do anything else. Instead, it will download the themes and store them in the user's local storage. This way, if the user doesn't have an internet connection and wants to read a particular theme, they can access it.

The themes won't just be text; they could also include infographics or illustrations. It would be useful to allow users to download or share the infographics. The illustrations will not be downloadable.

To "modularize" the themes, it would be helpful to have "tutorials" within each theme. The tutorials would be a separate screen, perhaps with screenshots, that guide the user on how to perform specific tasks within the app. That is, they should relate the app's tools to the concepts they've learned. For example, in this field you enter the category; here you can differentiate between expenses, needs, and obligations.

## Section Transaction handling:

One constraint on transactions is the requirement for the user to have an existing account. To remove this barrier, a default account will be created automatically when the user signs up. We shouldn't call it "default account," though; we need a better name. Since there is no need to force the user to create additional accounts at this stage, they can start logging transactions immediately.

### Balance updates

We need to determine the right point to allow the user to adjust their initial account balance—essentially specifying a starting amount to track from that point forward. We need to design the behavior for these adjustments or balance updates (`balance_adjustments`). This would be an entity independent of transactions.

```
balance_adjustments
-------------------
id
account_id
user_id
amount
previous_balance
new_balance
adjustment_date
reason
created_at
```

Where: amount = new_balance - previous_balance

#### How is the balance calculated?

The adjustment establishes a new reference point:

> "From this moment on, Rumbo knows this account holds $1,250."

The adjustment becomes a **balance checkpoint**.

#### Statistics

We don't want a scenario a year from now where it shows:

> 💸 Expenses this year: $17,350

>  Includes $10,000 in adjustments

That would be terrible, as it would make the user feel guilty. Therefore, **adjustments should not be treated as income or expenses in flow statistics**.

I would separate the concepts into two categories:

**Financial flow:**

* Income
* Expenses
* Transfers

**Reconciliations**

* Balance adjustments

In the standard UI, **adjustments shouldn't even appear as transactions**. Doing so would significantly clutter the user experience. Adjustments might only appear when:

*   the user accesses their account history and enables "Show adjustments"
*   they review account information
*   they investigate a discrepancy
*   they want to audit their history

## Add transaction menu

We need to fine-tune the "add transaction" menu. This is an action the user will repeat over and over again. It needs to be quick, easy, and provide a satisfying user experience.

We should also consider automation tools, such as:

### Recurring transactions

It is very common for users to have recurring transactions—expenses that repeat monthly, like rent or service subscriptions, as well as income sources like salaries.

### Transaction suggestions

There are also transactions that likely occur but cannot be fully automated via recurring transactions. For example, a user might pay off a credit card every month. In the app, this appears as a transfer from a debit account to the credit card account. We know the transaction is likely to happen and could even estimate the amount (based on credit card spending), but the user needs to confirm both the transaction and the amount; we can only suggest it.

There are many scenarios like this—for instance, a salary that varies in amount but arrives on a consistent date. To assist the user, we should provide a tool to configure these suggestions and allow them to quickly confirm or reject them on the dashboard upon opening the app.

### Automatic categories

Another highly beneficial tool for the user is the ability to create automatic categorization rules. For example, a transaction labeled "coffee" could be automatically categorized under "wants." Users could create multiple rules like this to eliminate manual categorization steps.

### Installment payments

This feature is already programmed into the app, but we must ensure it isn't overlooked or rendered non-functional. It is useful for the user to be able to add an installment payment—whether interest-bearing or interest-free—in a single transaction, allowing them to forecast future payments.

## Dashboard

The dashboard needs to become a key section of the app. We must streamline the time it takes for the user to interact with the app. As previously mentioned, the majority of user actions will involve adding transactions; we should provide direct access to this feature from the dashboard so they can get started with a single tap.

We also need to consider what the user would like to see immediately upon opening the app, as well as what—even if they *want* to see it—might result in a poor user experience.

For instance, a user might be interested in checking their current balance; however, there are cases where a user relies on the app because they are struggling financially, and seeing that balance every time they open the app could make them feel bad. Perhaps displaying the balance directly on the dashboard isn't necessary, but providing a shortcut to a separate page where they can view it—along with a general financial summary—might be a better approach.

On the dashboard, it might be better to display an indicator of what they are doing right guided by the habits found in the learning section.

What the dashboard *should* include is direct access to an in-app section that allows users to analyze their finances. This section should provide various statistical and calculation tools, such as:

*   Viewing income vs. expenses over a customizable time period.
*   Analyzing expenses by category.
*   Projecting future expenses.
*   Viewing balance distribution (by account or account type).
*   And other calculations deemed necessary for personal finance analysis—though, of course, without overwhelming the user with too many options.

Above all, the dashboard should offer a warm welcome to the app, creating a pleasant—rather than overwhelming—impression.

# Key learning concepts

1.  Income vs. expenses
2.  Net worth (brief overview of assets and liabilities; to be explored in greater depth later).
3.  Saving (saving vs. investing; brief overview, as there will be a dedicated investment section later).
4.  Debt
5.  Expense categories (needs, wants, and obligations)