import axios from "axios";
import { Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { FaChartLine } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Customer {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  customer_id: string;
  date: string;
  amount: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export default function TableOfData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const getCustomers = () => {
    axios
      .get(`http://localhost:3000/customers`)
      .then((response) => {
        setCustomers(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getTransactions = () => {
    axios
      .get(`http://localhost:3000/transactions`)
      .then((response) => {
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  type FilterType = "customer" | "amount";
  const handleFilter = (filterType: FilterType, value: string): void => {
    let filtered = transactions;
    if (filterType === "customer") {
      filtered = transactions.filter((transaction) =>
        customers
          .find((customer) => customer.id === transaction.customer_id)
          ?.name.toLowerCase()
          .includes(value.toLowerCase())
      );
    } else if (filterType === "amount") {
      filtered = transactions.filter((transaction) =>
        transaction.amount.toString().includes(value)
      );
    }
    setFilteredTransactions(filtered);
  };

  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
  };

  const chartData: ChartData = {
    labels: selectedCustomer
      ? Array.from(
          new Set(
            filteredTransactions
              .filter(
                (transaction) => transaction.customer_id === selectedCustomer.id
              )
              .map((transaction) => transaction.date)
          )
        )
      : [],
    datasets: [
      {
        label: "Transaction Amount",
        data: selectedCustomer
          ? Object.values(
              filteredTransactions
                .filter(
                  (transaction) =>
                    transaction.customer_id === selectedCustomer.id
                )
                .reduce((acc: { [key: string]: number }, curr) => {
                  acc[curr.date] = (acc[curr.date] || 0) + curr.amount;
                  return acc;
                }, {})
            )
          : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  useEffect(() => {
    getCustomers();
    getTransactions();
  }, []);

  return (
    <>
    <div className="text-center text-4xl font-bold my-2">
    <h1>Customers' Transactions Data</h1>
    </div>
      <div className="flex justify-center items-center my-2">
        <div className="flex justify-between items-center w-2/3">
          <div className="w-full mr-2 ">
            <input
              onChange={(e) => handleFilter("customer", e.target.value)}
              type="text"
              placeholder="Filter by customer name"
              className="w-full rounded-full"
            />
          </div>
          <div className="w-full ">
            <input
              onChange={(e) => handleFilter("amount", e.target.value)}
              type="number"
              className="w-full rounded-full"
              placeholder="Filter by transaction amount"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto w-[100%] md:w-[70%] h-[85vh] md:h-[auto] m-auto  py-0 md:py-2 mb-0 md:mb-5">
        <Table hoverable>
          <Table.Head className="text-white">
            <Table.HeadCell className="bg-main">ID</Table.HeadCell>
            <Table.HeadCell className="bg-main">Customer</Table.HeadCell>
            <Table.HeadCell className="bg-main">Date</Table.HeadCell>
            <Table.HeadCell className="bg-main">Amount</Table.HeadCell>
            <Table.HeadCell className="bg-main">Details</Table.HeadCell>
          </Table.Head>

          <Table.Body className="divide-y-8">
            {filteredTransactions.map((transaction) => {
              return (
                <Table.Row
                  key={transaction.id}
                  className="whitespace-nowrap font-medium text-gray-900 bg-blue-200 "
                >
                  <Table.Cell>{transaction.id}</Table.Cell>
                  <Table.Cell>
                    {
                      customers.find(
                        (customer) => customer.id === transaction.customer_id
                      )?.name
                    }
                  </Table.Cell>
                  <Table.Cell>{transaction.date}</Table.Cell>
                  <Table.Cell>{transaction.amount}</Table.Cell>
                  <Table.Cell>
                    <FaChartLine
                    className="hover:cursor-pointer text-green-600 text-xl"
                      onClick={() =>
                        handleSelectCustomer(
                          customers.find(
                            (customer) =>
                              customer.id === transaction.customer_id
                          ) || null
                        )
                      }
                    />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <div className="my-4">
          {selectedCustomer && (
            <div>
              <h2 className="text-black text-xl font-bold">
                {selectedCustomer.name}'s Transactions
              </h2>
              <Bar data={chartData} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
